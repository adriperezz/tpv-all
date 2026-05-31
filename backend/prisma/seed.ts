import { PrismaClient, Rol } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Tipos de ticket
  await prisma.tipoTicket.upsert({
    where: { nombre: 'COPA' },
    update: { color: '#88E788' },
    create: { nombre: 'COPA', color: '#88E788' },
  });

  await prisma.tipoTicket.upsert({
    where: { nombre: 'CERVEZA_REFRESCO' },
    update: { color: '#D97706' },
    create: { nombre: 'CERVEZA_REFRESCO', color: '#D97706' },
  });

  // Usuarios admin (4 fijos)
  const admins = [
    { nombre: 'Kike', pin: '1010' },
    { nombre: 'Pablo', pin: '8912' },
    { nombre: 'Adri', pin: '0822' },
    { nombre: 'Admin4', pin: '4444' },
  ];

  for (const a of admins) {
    await prisma.usuario.upsert({
      where: { nombre: a.nombre },
      update: {},
      create: { nombre: a.nombre, pin: await hash(a.pin, 10), rol: Rol.ADMIN },
    });
  }

  // Usuarios taquilla (3 fijos)
  const taquillas = [
    { nombre: 'Taquilla1', pin: '0001' },
    { nombre: 'Taquilla2', pin: '0002' },
    { nombre: 'Taquilla3', pin: '0003' },
  ];

  for (const t of taquillas) {
    await prisma.usuario.upsert({
      where: { nombre: t.nombre },
      update: {},
      create: { nombre: t.nombre, pin: await hash(t.pin, 10), rol: Rol.TAQUILLA },
    });
  }

  console.log('Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
