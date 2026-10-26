import { ApiProperty } from '@nestjs/swagger';
import { Answer } from '../entities/answer.entity';

export class AnswerResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ description: 'Valor numérico (score) asociado a la opción' })
  value!: number;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ format: 'uuid', description: 'Perfil al que pertenece' })
  answerProfileId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  static fromEntity(entity: Answer): AnswerResponseDto {
    const dto = new AnswerResponseDto();
    dto.id = entity.id;
    dto.label = entity.label;
    dto.value = entity.value;
    dto.sortOrder = entity.sortOrder;
    dto.isActive = entity.isActive;
    dto.answerProfileId = entity.answerProfile?.id ?? '';
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}