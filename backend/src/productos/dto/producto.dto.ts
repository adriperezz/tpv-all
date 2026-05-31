import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ProductoTicketDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tipoTicketId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CreateProductoDto {
  @ApiProperty({ example: 'Copa Vino' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 2.0 })
  @IsNumber()
  @Min(0)
  precio!: number;

  @ApiProperty({ type: [ProductoTicketDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoTicketDto)
  tickets!: ProductoTicketDto[];
}

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}

export class ToggleActivoDto {
  @ApiProperty()
  @IsBoolean()
  activo!: boolean;
}

export class PatchTipoTicketDto {
  @ApiPropertyOptional({ example: '#88E788' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'COPA' })
  @IsOptional()
  @IsString()
  nombre?: string;
}

export class CreateTipoTicketDto {
  @ApiProperty({ example: 'VERMUT' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: '#A855F7' })
  @IsString()
  color!: string;
}
