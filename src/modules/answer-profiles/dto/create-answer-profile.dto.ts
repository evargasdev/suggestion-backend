import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const LABEL_MAX = 255;

export class CreateAnswerProfileDto {
  @ApiProperty({
    description: 'Nombre del perfil de respuestas (escala Likert, etc.)',
    example: 'Likert 1-5',
    maxLength: LABEL_MAX,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'label no puede estar vacío' })
  label!: string;
}