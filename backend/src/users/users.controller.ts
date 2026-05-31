import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Rol } from 'src/auth/roles/roles';
import { UsersService } from './users.service';

class UpdateUsuarioDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() @MinLength(4) @MaxLength(8) nuevoPin?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

@ApiTags('usuarios')
@Controller('usuarios')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios (id, nombre, rol, activo)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Actualizar nombre, PIN o estado activo de un usuario (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usersService.update(id, dto);
  }
}
