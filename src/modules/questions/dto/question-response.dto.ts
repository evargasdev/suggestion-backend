import { ApiProperty } from '@nestjs/swagger';
import { Question } from '../entities/question.entity';

export class QuestionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  helperText!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isRequired!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ format: 'uuid' })
  dimensionId!: string;

  @ApiProperty({ format: 'uuid' })
  answerProfileId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  static fromEntity(entity: Question): QuestionResponseDto {
    const dto = new QuestionResponseDto();
    dto.id = entity.id;
    dto.label = entity.label;
    dto.sortOrder = entity.sortOrder;
    dto.isRequired = entity.isRequired;
    dto.isActive = entity.isActive;
    dto.dimensionId = entity.dimension?.id ?? '';
    dto.answerProfileId = entity.answerProfile?.id ?? '';
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}