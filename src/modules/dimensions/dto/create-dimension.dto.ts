import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const LABEL_MAX = 255;

export class CreateDimensionDto {
  @ApiProperty({
    description: 'Etiqueta visible de la dimensión',
    example: 'Carga de trabajo',
    maxLength: LABEL_MAX,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'label no puede estar vacío' })
  label!: string;

  @ApiProperty({ description: 'Orden de presentación', example: 0, default: 0 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(9_999)
  sortOrder?: number;

  @ApiProperty({
    description: 'Si la dimensión está activa en la encuesta pública',
    default: true,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
