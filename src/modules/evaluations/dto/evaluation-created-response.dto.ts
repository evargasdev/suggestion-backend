import { ApiProperty } from '@nestjs/swagger';
import { Evaluation } from '../entities/evaluation.entity';

/**
 * Respuesta pública al crear una evaluación. Solo expone el id y la fecha;
 * no se devuelven datos privados del participante (porque NO se capturan).
 */
export class EvaluationCreatedResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'date-time' })
  date!: Date;

  static fromEntity(entity: Evaluation): EvaluationCreatedResponseDto {
    const dto = new EvaluationCreatedResponseDto();
    dto.id = entity.id;
    dto.date = entity.date;
    return dto;
  }
}