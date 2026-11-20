import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatDto {
  @ApiProperty()
  sector!: string;

  @ApiProperty()
  position!: string;

  @ApiProperty({ format: 'uuid' })
  dimensionId!: string;

  @ApiProperty()
  dimensionLabel!: string;

  @ApiProperty({ description: 'Promedio del puntaje normalizado' })
  averageScore!: number;

  @ApiProperty({ description: 'Conteo de evaluaciones agregadas' })
  evaluationCount!: number;
}
