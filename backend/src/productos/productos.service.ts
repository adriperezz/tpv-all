import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrinterService } from 'src/printer/printer.service';
import { PrismaService } from 'src/prisma.service';
import { CreateProductoDto, CreateTipoTicketDto, PatchTipoTicketDto, UpdateProductoDto } from './dto/producto.dto';

function normalizarNombre(nombre: string): string {
  return nombre.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const INCLUDE_TICKETS = {
  productoTickets: {
    include: { tipoTicket: true },
  },
};

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private printer: PrinterService,
  ) {}

  findAll(soloActivos = false) {
    return this.prisma.producto.findMany({
      where: soloActivos ? { activo: true } : undefined,
      include: INCLUDE_TICKETS,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const p = await this.prisma.producto.findUnique({ where: { id }, include: INCLUDE_TICKETS });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }

  async create(dto: CreateProductoDto) {
    const existe = await this.prisma.producto.findUnique({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`Ya existe un producto con el nombre "${dto.nombre}"`);

    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: { nombre: dto.nombre, precio: dto.precio },
      });

      await tx.productoTicket.createMany({
        data: dto.tickets.map((t) => ({
          productoId: producto.id,
          tipoTicketId: t.tipoTicketId,
          cantidad: t.cantidad,
        })),
      });

      return tx.producto.findUnique({ where: { id: producto.id }, include: INCLUDE_TICKETS });
    });
  }

  async update(id: number, dto: UpdateProductoDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.producto.update({
        where: { id },
        data: {
          ...(dto.nombre !== undefined && { nombre: dto.nombre }),
          ...(dto.precio !== undefined && { precio: dto.precio }),
        },
      });

      if (dto.tickets !== undefined) {
        await tx.productoTicket.deleteMany({ where: { productoId: id } });
        await tx.productoTicket.createMany({
          data: dto.tickets.map((t) => ({
            productoId: id,
            tipoTicketId: t.tipoTicketId,
            cantidad: t.cantidad,
          })),
        });
      }

      return tx.producto.findUnique({ where: { id }, include: INCLUDE_TICKETS });
    });
  }

  async toggleActivo(id: number, activo: boolean) {
    await this.findOne(id);
    return this.prisma.producto.update({ where: { id }, data: { activo } });
  }

  findTiposTicket() {
    return this.prisma.tipoTicket.findMany({ orderBy: { nombre: 'asc' } });
  }

  async delete(id: number) {
    await this.findOne(id);

    const ventas = await this.prisma.lineaVenta.count({ where: { productoId: id } });
    if (ventas > 0) {
      throw new ConflictException(
        `Este producto tiene ${ventas} venta(s) registradas y no se puede eliminar. Desactívalo en su lugar.`,
      );
    }

    await this.prisma.productoTicket.deleteMany({ where: { productoId: id } });
    return this.prisma.producto.delete({ where: { id } });
  }

  async uploadImagenTipoTicket(id: number, file: Express.Multer.File) {
    const tipo = await this.prisma.tipoTicket.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de ticket no encontrado');

    const clave = normalizarNombre(tipo.nombre);
    const dir = path.join(process.cwd(), 'assets', 'tickets');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${clave}.png`), file.buffer);

    await this.printer.recargarTickets();
    return { ok: true, archivo: `${clave}.png` };
  }

  async createTipoTicket(dto: CreateTipoTicketDto) {
    const existe = await this.prisma.tipoTicket.findUnique({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`Ya existe un tipo de ticket con el nombre "${dto.nombre}"`);
    return this.prisma.tipoTicket.create({ data: { nombre: dto.nombre, color: dto.color } });
  }

  updateTipoTicket(id: number, dto: PatchTipoTicketDto) {
    return this.prisma.tipoTicket.update({
      where: { id },
      data: {
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
      },
    });
  }
}
