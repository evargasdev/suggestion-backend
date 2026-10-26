import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const LABEL_MAX = 255;

export class UpdateDimensionDto {
  @ApiProperty({ required: false, maxLength: LABEL_MAX })
  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(LABEL_MAX)
  @IsNotEmpty({ message: 'label no puede estar vacío' })
  label?: string;

  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(9_999)
  sortOrder?: number;

  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
