import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AnswerInputDto {
  @ApiProperty({ format: 'uuid', description: 'ID de la pregunta respondida' })
  @IsUUID('4')
  questionId!: string;

  @ApiProperty({ format: 'uuid', description: 'ID de la opción elegida' })
  @IsUUID('4')
  answerId!: string;
}

export class SubmitEvaluationDto {
  @ApiProperty({
    type: () => [AnswerInputDto],
    description: 'Lista de respuestas del participante',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => AnswerInputDto)
  answers!: AnswerInputDto[];
}