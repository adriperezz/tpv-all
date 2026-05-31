import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: { id: true, nombre: true, rol: true, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  findByIdWithPin(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, pin: true, rol: true, activo: true },
    });
  }

  async update(id: number, dto: { nombre?: string; nuevoPin?: string; activo?: boolean }) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.nuevoPin !== undefined) data.pin = await hash(dto.nuevoPin, 10);
    if (dto.activo !== undefined) data.activo = dto.activo;

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, rol: true, activo: true },
    });
  }
}
