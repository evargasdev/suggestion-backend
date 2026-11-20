import { ApiProperty } from '@nestjs/swagger';

/** Puntaje por dimensión para `GET /evaluations/:id/results`. */
export class EvaluationDimensionResultDto {
  @ApiProperty({ format: 'uuid' })
  dimensionId!: string;

  @ApiProperty()
  dimensionLabel!: string;

  @ApiProperty({
    description:
      'Puntaje de la dimensión; se normaliza al total de reactivos cuando hay respuestas «No aplica».',
  })
  score!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Clasificación según las bandas definidas para la dimensión. Es `null` si no hubo respuestas puntuables.',
  })
  classification!: string | null;
}

export class EvaluationResultsResponseDto {
  @ApiProperty({ format: 'uuid' })
  evaluationId!: string;

  @ApiProperty({ type: () => [EvaluationDimensionResultDto] })
  results!: EvaluationDimensionResultDto[];
}
