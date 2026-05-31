import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Rol } from 'src/auth/roles/roles';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@Roles(Rol.ADMIN)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen del día o de un período desde/hasta' })
  @ApiQuery({ name: 'fecha', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'desde', required: false, description: 'ISO datetime' })
  @ApiQuery({ name: 'hasta', required: false, description: 'ISO datetime' })
  resumen(@Query('fecha') fecha?: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    if (desde !== undefined || hasta !== undefined) return this.service.resumenPeriodo(desde, hasta);
    return this.service.resumenDia(fecha);
  }

  @Get('facturacion')
  @ApiOperation({ summary: 'Facturación por días (últimos N días)' })
  @ApiQuery({ name: 'dias', required: false, type: Number })
  facturacion(@Query('dias') dias?: string) {
    return this.service.facturacionPorDias(dias ? Number(dias) : 30);
  }

  @Get('log-acciones')
  @ApiOperation({ summary: 'Log de acciones admin' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  logAcciones(@Query('limit') limit?: string) {
    return this.service.logAcciones(limit ? Number(limit) : 100);
  }

  @Get('tickets-global')
  @ApiOperation({ summary: 'Contadores globales de tickets por tipo' })
  ticketsGlobal() {
    return this.service.ticketsGlobal();
  }
}
