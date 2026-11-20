import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { SubmitEvaluationDto } from './submit-evaluation.dto';

const validPayload = {
  demographics: {
    ageRange: '24 a 29 años',
    genderIdentity: 'Mujer heterosexual',
    vulnerableGroups: ['Mujer indígena'],
    origin: 'Quintana Roo',
    hasCareResponsibilities: false,
    careResponsibilitiesDetails: [],
    activityType: 'Operativo',
    sector: 'Hotelería',
    position: 'Dirección',
  },
  answers: [
    {
      questionId: '123e4567-e89b-42d3-a456-426614174000',
      answerId: '123e4567-e89b-42d3-a456-426614174001',
    },
  ],
};

function findConstraintMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...findConstraintMessages(error.children ?? []),
  ]);
}

async function validatePayload(
  changes: Partial<typeof validPayload> = {},
): Promise<string[]> {
  const dto = plainToInstance(SubmitEvaluationDto, {
    ...validPayload,
    ...changes,
  });
  return findConstraintMessages(await validate(dto));
}

describe('SubmitEvaluationDto structural validation', () => {
  it('accepts a structurally valid submission', async () => {
    expect(await validatePayload()).toEqual([]);
  });

  it('rejects combining none-of-the-above with another vulnerable group', async () => {
    const messages = await validatePayload({
      demographics: {
        ...validPayload.demographics,
        vulnerableGroups: ['Ninguna de las anteriores', 'Mujer indígena'],
      },
    });

    expect(messages).toContain(
      'The "none of the above" vulnerable group cannot be combined with other options',
    );
  });

  it('requires care details to match the care-responsibility flag', async () => {
    const messages = await validatePayload({
      demographics: {
        ...validPayload.demographics,
        hasCareResponsibilities: true,
        careResponsibilitiesDetails: [],
      },
    });

    expect(messages).toContain(
      'Care responsibility details must match hasCareResponsibilities',
    );
  });

  it('rejects duplicate question IDs', async () => {
    const messages = await validatePayload({
      answers: [
        ...validPayload.answers,
        {
          questionId: validPayload.answers[0].questionId,
          answerId: '123e4567-e89b-42d3-a456-426614174002',
        },
      ],
    });

    expect(messages).toContain(
      'Question 123e4567-e89b-42d3-a456-426614174000 appears more than once in the answers array',
    );
  });
});
