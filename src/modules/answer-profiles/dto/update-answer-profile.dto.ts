import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const LABEL_MAX = 255;

export class UpdateAnswerProfileDto {
  @ApiProperty({ required: false, maxLength: LABEL_MAX })
  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'label no puede estar vacío' })
  label?: string;
}