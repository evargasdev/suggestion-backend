import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/shared/dtos/pagination.dto';

export class FilterQuestionDto extends PaginationDto {
  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  dimensionId?: string;
}