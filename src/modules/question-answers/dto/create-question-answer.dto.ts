import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateQuestionAnswerDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Evaluación a la que pertenece la respuesta',
  })
  @IsUUID('4')
  evaluationId!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Pregunta a la que pertenece la respuesta',
  })
  @IsUUID('4')
  questionId!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Respuesta que pertenece a la pregunta',
  })
  @IsUUID('4')
  answerId!: string;
}
