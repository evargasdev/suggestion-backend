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

export class CreateAnswerDto {
  @ApiProperty({ maxLength: LABEL_MAX })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'label no puede estar vacío' })
  label!: string;

  @ApiProperty({
    description: 'Valor numérico (score) asociado a la opción',
    example: 3,
  })
  @IsInt()
  @Min(-1_000_000)
  @Max(1_000_000)
  value!: number;

  @ApiProperty({ required: false, default: 0 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(9_999)
  sortOrder?: number;

  @ApiProperty({ required: false, default: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ format: 'uuid', description: 'Perfil al que pertenece la opción' })
  @IsUUID('4')
  answerProfileId!: string;
}