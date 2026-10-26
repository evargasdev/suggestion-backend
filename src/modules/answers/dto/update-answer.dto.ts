import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const LABEL_MAX = 255;

export class UpdateAnswerDto {
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
  @Min(-1_000_000)
  @Max(1_000_000)
  value?: number;

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

  @ApiProperty({ format: 'uuid', required: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsUUID('4')
  answerProfileId?: string;
}