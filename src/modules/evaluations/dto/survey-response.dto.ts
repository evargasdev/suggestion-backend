import { ApiProperty } from '@nestjs/swagger';

/** Opción de respuesta tal y como se expone en el catálogo público. */
export class SurveyAnswerOptionDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  sortOrder!: number;
}

/** Pregunta del catálogo público (NO incluye `value` de las respuestas). */
export class SurveyQuestionDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isRequired!: boolean;

  @ApiProperty({ type: () => [SurveyAnswerOptionDto] })
  answers!: SurveyAnswerOptionDto[];
}

/** Dimensión del catálogo público con sus preguntas activas. */
export class SurveyDimensionDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: () => [SurveyQuestionDto] })
  questions!: SurveyQuestionDto[];
}

/** Respuesta del endpoint `GET /evaluations/survey`. */
export class SurveyResponseDto {
  @ApiProperty({ type: () => [SurveyDimensionDto] })
  dimensions!: SurveyDimensionDto[];
}