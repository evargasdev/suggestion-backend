import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  EvaluationDemographicsDto,
  SubmitEvaluationDto,
} from './submit-evaluation.dto';

const validDemographics = {
  ageRange: '24 a 29 años',
  genderIdentity: 'mujer heterosexual',
  vulnerableGroups: [],
  origin: 'Quintana Roo',
  hasCareResponsibilities: false,
  careResponsibilitiesDetails: [],
  activityType: 'operativo',
  sector: 'Hotelería',
  position: 'gerencia',
};

describe('EvaluationDemographicsDto', () => {
  it.each([
    'mujer heterosexual',
    'mujer lesbiana',
    'mujer bisexual',
    'mujer trans',
  ])('accepts the test identity "%s"', async (genderIdentity) => {
    const dto = plainToInstance(EvaluationDemographicsDto, {
      ...validDemographics,
      genderIdentity,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an identity that is not an option for women in the test', async () => {
    const dto = plainToInstance(EvaluationDemographicsDto, {
      ...validDemographics,
      genderIdentity: 'hombre',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('genderIdentity');
  });

  it('requires demographics on every submission', async () => {
    const dto = plainToInstance(SubmitEvaluationDto, { answers: [] });
    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('demographics');
  });
});
