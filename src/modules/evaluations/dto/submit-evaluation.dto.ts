import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function IsExclusiveNoneOfTheAbove(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'isExclusiveNoneOfTheAbove',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) return true;
          return (
            !value.some(
              (group) =>
                typeof group === 'string' &&
                group.toLocaleLowerCase('es') === 'ninguna de las anteriores',
            ) || value.length <= 1
          );
        },
      },
    });
  };
}

function MatchesCareResponsibilities(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'matchesCareResponsibilities',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const details = (args.object as EvaluationDemographicsDto)
            .careResponsibilitiesDetails;
          if (typeof value !== 'boolean' || !Array.isArray(details)) {
            return true;
          }
          return value === details.length > 0;
        },
      },
    });
  };
}

function HasUniqueQuestionIds(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'hasUniqueQuestionIds',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) return true;
          const questionIds = value
            .filter(
              (answer): answer is { questionId: string } =>
                typeof answer?.questionId === 'string',
            )
            .map((answer) => answer.questionId);
          return new Set(questionIds).size === questionIds.length;
        },
        defaultMessage(args: ValidationArguments): string {
          if (Array.isArray(args.value)) {
            const seen = new Set<string>();
            for (const answer of args.value) {
              if (typeof answer?.questionId !== 'string') continue;
              if (seen.has(answer.questionId)) {
                return `Question ${answer.questionId} appears more than once in the answers array`;
              }
              seen.add(answer.questionId);
            }
          }
          return 'Question IDs must be unique in the answers array';
        },
      },
    });
  };
}

const AGE_RANGES = [
  'Menor a 18 años',
  '18 a 23 años',
  '24 a 29 años',
  '30 a 35 años',
  '36 a 41 años',
  '42 a 47 años',
  '48 a 53 años',
  '54 a 59 años',
  '60 a 65 años',
  'Mayor a 65 años',
];

const WOMAN_GENDER_IDENTITIES = [
  'Mujer heterosexual',
  'Mujer lesbiana',
  'Mujer bisexual',
  'Mujer trans',
];

const VULNERABLE_GROUPS = [
  'Mujer migrante',
  'Mujer indígena',
  'Mujer afrodescendiente',
  'Mujer con discapacidad',
  'Ninguna de las anteriores',
];

const CARE_RESPONSIBILITIES = [
  'Hijos o hijas',
  'Personas mayores',
  'Personas enfermas',
  'Personas con alguna discapacidad',
];

const ACTIVITY_TYPES = ['Administrativo', 'Operativo', 'Mixto'];
const SECTORS = [
  'Hotelería',
  'Restaurante',
  'Parque temático',
  'Operadora turística',
];
const POSITIONS = [
  'Dirección',
  'Gerencia',
  'Jefatura de departamento o área',
  'Supervisión o coordinación',
  'Sin personal a cargo',
  'Por comisión',
];

export class AnswerInputDto {
  @ApiProperty({ format: 'uuid', description: 'ID de la pregunta respondida' })
  @IsUUID('4')
  questionId!: string;

  @ApiProperty({ format: 'uuid', description: 'ID de la opción elegida' })
  @IsUUID('4')
  answerId!: string;
}

export class EvaluationDemographicsDto {
  @ApiProperty({ enum: AGE_RANGES })
  @IsIn(AGE_RANGES)
  ageRange!: string;

  @ApiProperty({
    enum: WOMAN_GENDER_IDENTITIES,
    description: 'El instrumento solo admite identidades de mujeres.',
  })
  @IsIn(WOMAN_GENDER_IDENTITIES)
  genderIdentity!: string;

  @ApiProperty({ enum: VULNERABLE_GROUPS, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsExclusiveNoneOfTheAbove({
    message:
      'The "none of the above" vulnerable group cannot be combined with other options',
  })
  @IsIn(VULNERABLE_GROUPS, { each: true })
  vulnerableGroups!: string[];

  @ApiProperty({
    description: 'Entidad federativa o país de origen si es extranjera.',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  origin!: string;

  @ApiProperty()
  @IsBoolean()
  @MatchesCareResponsibilities({
    message: 'Care responsibility details must match hasCareResponsibilities',
  })
  hasCareResponsibilities!: boolean;

  @ApiProperty({ enum: CARE_RESPONSIBILITIES, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsIn(CARE_RESPONSIBILITIES, { each: true })
  careResponsibilitiesDetails!: string[];

  @ApiProperty({ enum: ACTIVITY_TYPES })
  @IsIn(ACTIVITY_TYPES)
  activityType!: string;

  @ApiProperty({ enum: SECTORS })
  @IsIn(SECTORS)
  sector!: string;

  @ApiProperty({ enum: POSITIONS })
  @IsIn(POSITIONS)
  position!: string;
}

export class SubmitEvaluationDto {
  @ApiProperty({ type: () => EvaluationDemographicsDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => EvaluationDemographicsDto)
  demographics!: EvaluationDemographicsDto;

  @ApiProperty({
    type: () => [AnswerInputDto],
    description: 'Lista de respuestas del participante',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @HasUniqueQuestionIds()
  @ValidateNested({ each: true })
  @Type(() => AnswerInputDto)
  answers!: AnswerInputDto[];
}
