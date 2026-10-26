import { ApiProperty } from '@nestjs/swagger';

/** Puntaje por dimensión para `GET /evaluations/:id/results`. */
export class EvaluationDimensionResultDto {
  @ApiProperty({ format: 'uuid' })
  dimensionId!: string;

  @ApiProperty()
  dimensionLabel!: string;

  @ApiProperty({ description: 'Suma bruta de los `value` de las respuestas en la dimensión' })
  score!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Clasificación (bajo/medio/alto, etc.). Es `null` mientras el dominio no defina los rangos.',
  })
  classification!: string | null;
}

export class EvaluationResultsResponseDto {
  @ApiProperty({ format: 'uuid' })
  evaluationId!: string;

  @ApiProperty({ type: () => [EvaluationDimensionResultDto] })
  results!: EvaluationDimensionResultDto[];
}