import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp') as (input: string | Buffer) => import('sharp').Sharp;

const ESC = 0x1b;
const GS = 0x1d;

const PAPER_PX = 576; // 72 mm @ 203 dpi

function normalizar(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

@Injectable()
export class PrinterService implements OnModuleInit {
  private readonly logger = new Logger(PrinterService.name);
  private readonly ticketsDir = path.join(process.cwd(), 'assets', 'tickets');

  // Cache: nombreNormalizado → Buffer ESC/POS listo para enviar
  private cache = new Map<string, Buffer>();

  async onModuleInit() {
    await this.recargarTickets();
  }

  async recargarTickets() {
    this.cache.clear();
    this.logger.log(`CWD: ${process.cwd()} | ticketsDir: ${this.ticketsDir}`);

    if (!fs.existsSync(this.ticketsDir)) {
      this.logger.warn(`Carpeta NO encontrada: ${this.ticketsDir}`);
      return;
    }

    const todos = fs.readdirSync(this.ticketsDir);
    this.logger.log(`Archivos en carpeta: [${todos.join(', ')}]`);

    const archivos = todos.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    for (const archivo of archivos) {
      const clave = archivo.replace(/\.[^.]+$/, '');
      try {
        const buf = await this.imagenAEscPos(path.join(this.ticketsDir, archivo));
        this.cache.set(clave, buf);
        this.logger.log(`Ticket cargado: ${archivo} → clave "${clave}"`);
      } catch (e: any) {
        this.logger.error(`Error cargando ${archivo}: ${e.message}`, e.stack);
      }
    }
    this.logger.log(`${this.cache.size} ticket(s) listos: [${[...this.cache.keys()].join(', ')}]`);
  }

  private async imagenAEscPos(filePath: string): Promise<Buffer> {
    const { data, info } = await sharp(filePath)
      .resize(PAPER_PX, undefined, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const bytesPerRow = Math.ceil(w / 8);
    const raster = Buffer.alloc(bytesPerRow * h, 0);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[y * w + x] < 128) {
          raster[y * bytesPerRow + Math.floor(x / 8)] |= 1 << (7 - (x % 8));
        }
      }
    }

    return Buffer.concat([
      Buffer.from([ESC, 0x40]),           // init
      Buffer.from([ESC, 0x61, 0x00]),     // left align (imagen full-width, no centrar)
      // GS v 0 — raster bit image
      Buffer.from([GS, 0x76, 0x30, 0x00,
        bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff,
        h & 0xff, (h >> 8) & 0xff]),
      raster,
      Buffer.from('\n', 'latin1'),
      Buffer.from([GS, 0x56, 0x41, 0x05]), // partial cut
    ]);
  }

  buildTickets(tiposNombre: string[]): Buffer[] {
    const slips: Buffer[] = [];
    for (const nombre of tiposNombre) {
      const clave = normalizar(nombre);
      const buf = this.cache.get(clave);
      if (buf) {
        slips.push(buf);
      } else {
        this.logger.warn(`Sin imagen para tipo "${nombre}" (clave "${clave}"). Tipos disponibles: [${[...this.cache.keys()].join(', ')}]`);
      }
    }
    return slips;
  }

  // Cola por impresora: garantiza que solo un job se envía a la vez por IP
  private printQueues = new Map<string, Promise<void>>();

  private conectar(ip: string, port: number, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let settled = false;
      let dataSent = false;

      const done = (err?: Error) => {
        if (settled) return;
        settled = true;
        if (!dataSent) socket.destroy();
        err ? reject(err) : resolve();
      };

      // Fase 1: timeout de conexión — generoso para WiFi congestionado
      socket.setTimeout(20_000);

      socket.connect(port, ip, () => {
        socket.write(data, (err) => {
          if (err) return done(err);
          dataSent = true;
          // Fase 2: datos enviados — timeout generoso para que el printer
          // imprima y corte antes de cerrar la conexión TCP
          socket.setTimeout(60_000);
          socket.end();
        });
      });

      socket.on('close', () => done());
      socket.on('error', (err) => done(err));
      socket.on('timeout', () => {
        if (dataSent) {
          // Los datos ya llegaron a la impresora; si tarda >60s en cerrar
          // es un problema del firmware — resolvemos igual para no reintentar
          done();
        } else {
          done(new Error(`Timeout ${ip}:${port}`));
        }
      });
    });
  }

  private async imprimirTickets(ip: string, tickets: Buffer[], port = 9100): Promise<void> {
    // Todos los tickets concatenados en UNA conexión TCP.
    // El corte ESC/POS embebido en cada buffer hace que la impresora
    // los separe sola sin pausas artificiales → máxima velocidad.
    const payload = Buffer.concat(tickets);
    const MAX_REINTENTOS = 5;

    for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
      try {
        await this.conectar(ip, port, payload);
        this.logger.log(`${tickets.length} ticket(s) enviados → ${ip}:${port} (${payload.length} bytes)`);
        return;
      } catch (err: any) {
        if (intento < MAX_REINTENTOS) {
          const espera = err.message.includes('ECONNRESET') ? 2_000 : 5_000;
          this.logger.warn(`Impresora ${ip} fallida (intento ${intento}/${MAX_REINTENTOS}): ${err.message} — reintentando en ${espera / 1000}s`);
          await new Promise(r => setTimeout(r, espera));
        } else {
          this.logger.error(`Impresora ${ip} abandonada tras ${MAX_REINTENTOS} intentos: ${err.message}`);
        }
      }
    }
  }

  dispararImpresion(ip: string | undefined, tickets: Buffer[], port = 9100): void {
    if (!ip || tickets.length === 0) return;

    // Encola el trabajo detrás del que esté en curso para esta IP
    const prev = this.printQueues.get(ip) ?? Promise.resolve();
    const job = prev
      .then(() => this.imprimirTickets(ip, tickets, port))
      .catch((err: Error) => this.logger.warn(`Error impresora ${ip}: ${err.message}`));

    this.printQueues.set(ip, job);
    // Limpiar referencia cuando el job termina (evita memory leak en sesiones largas)
    void job.finally(() => {
      if (this.printQueues.get(ip) === job) this.printQueues.delete(ip);
    });
  }
}
