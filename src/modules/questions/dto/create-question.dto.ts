import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const LABEL_MAX = 255;

/**
 * `label` se recorta ANTES de validar para que strings de solo
 * whitespace se rechacen con `@IsNotEmpty` (post-trim queda length 0).
 * Los demás campos opcionales usan `@ValidateIf` (en lugar de
 * `@IsOptional`) para que `null` se rechace con 400 en lugar de
 * propagar al servicio.
 */
export class CreateQuestionDto {
  @ApiProperty({ maxLength: LABEL_MAX })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'label no puede estar vacío' })
  label!: string;

  @ApiProperty({ maxLength: LABEL_MAX })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'helperText no puede estar vacío' })
  helperText!: string;

  @ApiProperty({ required: false, default: 0 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(9_999)
  sortOrder?: number;

  @ApiProperty({ required: false, default: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ required: false, default: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  dimensionId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  answerProfileId!: string;
}