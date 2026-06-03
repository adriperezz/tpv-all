import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AbrirSesionDto, CerrarSesionDto } from './dto/sesion.dto';

@Injectable()
export class SesionesCajaService {
  constructor(private prisma: PrismaService) {}

  async abrir(dto: AbrirSesionDto, usuarioId: number) {
    const abierta = await this.prisma.sesionCaja.findFirst({
      where: { taquilla: dto.taquilla, cierre: null },
    });
    if (abierta) throw new BadRequestException('Ya hay una sesión abierta en esta taquilla');

    return this.prisma.sesionCaja.create({
      data: { taquilla: dto.taquilla, usuarioId },
    });
  }

  private async ultimoCierre(taquilla: number): Promise<Date> {
    const ultimo = await this.prisma.sesionCaja.findFirst({
      where: { taquilla, cierre: { not: null } },
      orderBy: { cierre: 'desc' },
    });
    // Sin cierre previo → desde el principio de los tiempos
    return ultimo?.cierre ?? new Date(0);
  }

  async parteX(taquilla: number) {
    const abierta = await this.prisma.sesionCaja.findFirst({
      where: { taquilla, cierre: null },
    });
    const desde = abierta?.apertura ?? await this.ultimoCierre(taquilla);
    return this.buildResumen(desde, new Date(), taquilla);
  }

  async cerrar(taquilla: number, dto: CerrarSesionDto, usuarioId: number) {
    const abierta = await this.prisma.sesionCaja.findFirst({
      where: { taquilla, cierre: null },
    });

    const desde = abierta?.apertura ?? await this.ultimoCierre(taquilla);
    const resumen = await this.buildResumen(desde, new Date(), taquilla);

    const { realEfectivo = null, realTarjeta = null, realTransferencia = null } = dto;

    const descuadre = (real: number | null, teorico: number) =>
      real !== null ? +(real - teorico).toFixed(2) : null;

    const snapshot = {
      ...resumen,
      realEfectivo,
      realTarjeta,
      realTransferencia,
      descuadreEfectivo: descuadre(realEfectivo, resumen.totalEfectivo),
      descuadreTarjeta: descuadre(realTarjeta, resumen.totalTarjeta),
      descuadreTransferencia: descuadre(realTransferencia, resumen.totalTransferencia),
      cerradoPor: usuarioId,
    };

    if (abierta) {
      return this.prisma.sesionCaja.update({
        where: { id: abierta.id },
        data: { cierre: new Date(), snapshot },
      });
    }

    return this.prisma.sesionCaja.create({
      data: { taquilla, usuarioId, apertura: desde, cierre: new Date(), snapshot },
    });
  }

  findHistorial(taquilla?: number) {
    return this.prisma.sesionCaja.findMany({
      where: taquilla ? { taquilla } : undefined,
      include: { usuario: { select: { id: true, nombre: true } } },
      orderBy: { apertura: 'desc' },
    });
  }

  async estadoTaquillas() {
    const NUMS = [1, 2, 3];

    const lastCierre = await this.prisma.sesionCaja.findFirst({
      where: { cierre: { not: null } },
      orderBy: { cierre: 'desc' },
    });

    const desde = lastCierre?.cierre ?? new Date(0);

    const ventasActivas = await this.prisma.venta.findMany({
      where: { timestamp: { gte: desde }, estado: 'ACTIVA' },
      include: { lineas: true },
    });

    const taquillas = NUMS.map((n) => {
      const vt = ventasActivas.filter((v) => v.taquilla === n);
      const ef = sumByMetodo(vt, 'EFECTIVO');
      const tar = sumByMetodo(vt, 'TARJETA');
      const trans = sumByMetodo(vt, 'TRANSFERENCIA');
      const totalGeneral = ef + tar + trans;
      return {
        numero: n,
        activa: vt.length > 0,
        totalVentas: vt.length,
        totalEfectivo: ef,
        totalTarjeta: tar,
        totalTransferencia: trans,
        totalGeneral,
      };
    });

    return {
      taquillas,
      totalGeneral: taquillas.reduce((s, t) => s + t.totalGeneral, 0),
      totalVentas: taquillas.reduce((s, t) => s + t.totalVentas, 0),
      totalEfectivo: taquillas.reduce((s, t) => s + t.totalEfectivo, 0),
      totalTarjeta: taquillas.reduce((s, t) => s + t.totalTarjeta, 0),
      totalTransferencia: taquillas.reduce((s, t) => s + t.totalTransferencia, 0),
    };
  }

  async periodos() {
    const cierres = await this.prisma.sesionCaja.findMany({
      where: { cierre: { not: null } },
      orderBy: { cierre: 'desc' },
      include: { usuario: { select: { nombre: true } } },
    });

    const lastCierre = cierres[0];
    const desdeAbierta = lastCierre?.cierre ?? new Date(0);

    return [
      {
        id: 'abierta' as const,
        label: 'Sesión abierta',
        desde: desdeAbierta.toISOString(),
        hasta: null as string | null,
        totalGeneral: null as number | null,
        totalVentas: null as number | null,
        cerradoEn: null as string | null,
        cerradoPor: null as string | null,
        taquilla: null as number | null,
      },
      ...cierres.map((c, i) => {
        const snap = c.snapshot as Record<string, any> | null;
        return {
          id: c.id,
          label: `Cierre #${cierres.length - i}`,
          taquilla: c.taquilla,
          desde: (c.apertura ?? new Date(0)).toISOString(),
          hasta: c.cierre!.toISOString(),
          cerradoEn: c.cierre!.toISOString(),
          cerradoPor: c.usuario.nombre,
          totalGeneral: (snap?.totalGeneral as number) ?? null,
          totalVentas: (snap?.totalVentas as number) ?? null,
          totalEfectivo: (snap?.totalEfectivo as number) ?? null,
          totalTarjeta: (snap?.totalTarjeta as number) ?? null,
          totalTransferencia: (snap?.totalTransferencia as number) ?? null,
          realEfectivo: (snap?.realEfectivo as number | null) ?? null,
          realTarjeta: (snap?.realTarjeta as number | null) ?? null,
          realTransferencia: (snap?.realTransferencia as number | null) ?? null,
          descuadreEfectivo: (snap?.descuadreEfectivo as number | null) ?? null,
          descuadreTarjeta: (snap?.descuadreTarjeta as number | null) ?? null,
          descuadreTransferencia: (snap?.descuadreTransferencia as number | null) ?? null,
        };
      }),
    ];
  }

  private async buildResumen(desde: Date, hasta: Date, taquilla?: number) {
    const baseWhere = {
      timestamp: { gte: desde, lte: hasta },
      ...(taquilla ? { taquilla } : {}),
    };

    const todasVentas = await this.prisma.venta.findMany({
      where: baseWhere,
      include: { lineas: true },
    });

    const activas = todasVentas.filter((v) => v.estado === 'ACTIVA');
    const anuladas = todasVentas.filter((v) => v.estado === 'ANULADA');

    const totalEfectivo = sumByMetodo(activas, 'EFECTIVO');
    const totalTarjeta = sumByMetodo(activas, 'TARJETA');
    const totalTransferencia = sumByMetodo(activas, 'TRANSFERENCIA');
    const totalGeneral = totalEfectivo + totalTarjeta + totalTransferencia;

    // Unidades por producto (solo activas)
    const productoMap: Record<number, { nombre: string; cantidad: number; total: number }> = {};
    for (const v of activas) {
      for (const l of v.lineas) {
        if (!productoMap[l.productoId]) {
          productoMap[l.productoId] = { nombre: l.nombreSnapshot, cantidad: 0, total: 0 };
        }
        productoMap[l.productoId].cantidad += l.cantidad;
        productoMap[l.productoId].total += Number(l.subtotal);
      }
    }

    // Tickets por tipo
    const tickets = await this.prisma.ticketFisico.findMany({
      where: {
        timestamp: { gte: desde, lte: hasta },
        ...(taquilla ? { taquilla } : {}),
      },
      include: { tipoTicket: true },
    });

    const tipoTicketMap: Record<string, number> = {};
    for (const t of tickets) {
      tipoTicketMap[t.tipoTicket.nombre] = (tipoTicketMap[t.tipoTicket.nombre] ?? 0) + 1;
    }

    // Anulaciones: quién anuló cada venta anulada
    let anulaciones: { ventaId: number; admin: string; timestamp: string; monto: number }[] = [];
    if (anuladas.length > 0) {
      const logs = await this.prisma.logAccion.findMany({
        where: { accion: 'ANULAR_VENTA', ventaId: { in: anuladas.map((v) => v.id) } },
        include: { usuario: { select: { nombre: true } } },
      });
      anulaciones = logs.map((l) => {
        const venta = anuladas.find((v) => v.id === l.ventaId);
        return {
          ventaId: l.ventaId!,
          admin: l.usuario.nombre,
          timestamp: l.timestamp.toISOString(),
          monto: venta?.lineas.reduce((s, li) => s + Number(li.subtotal), 0) ?? 0,
        };
      });
    }

    const totalMontoAnulado = anulaciones.reduce((s, a) => s + a.monto, 0);

    return {
      desde,
      hasta,
      taquilla,
      totalVentas: activas.length,
      totalEfectivo,
      totalTarjeta,
      totalTransferencia,
      totalGeneral,
      productoResumen: Object.values(productoMap),
      ticketResumen: tipoTicketMap,
      totalVentasAnuladas: anuladas.length,
      totalMontoAnulado,
      anulaciones,
    };
  }
}

function sumByMetodo(ventas: any[], metodo: string): number {
  return ventas
    .filter((v) => v.metodoPago === metodo)
    .reduce((sum, v) => sum + v.lineas.reduce((s: number, l: any) => s + Number(l.subtotal), 0), 0);
}

