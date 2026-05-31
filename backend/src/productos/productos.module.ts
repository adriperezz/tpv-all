import { Module } from '@nestjs/common';
import { PrinterModule } from 'src/printer/printer.module';
import { PrismaService } from 'src/prisma.service';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  imports: [PrinterModule],
  providers: [ProductosService, PrismaService],
  controllers: [ProductosController],
  exports: [ProductosService],
})
export class ProductosModule {}
