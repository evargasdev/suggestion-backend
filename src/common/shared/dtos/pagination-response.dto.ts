import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty({
    type: () => Object,
    isArray: true,
    description: 'Resultados de la página. El tipo concreto lo declara el endpoint.',
  })
  data!: T[];

  @ApiProperty({ description: 'Total de elementos sin paginar' })
  total!: number;

  @ApiProperty({ description: 'Offset aplicado (eco del request)' })
  offset!: number;

  @ApiProperty({ description: 'Limit aplicado (eco del request)' })
  limit!: number;
}
