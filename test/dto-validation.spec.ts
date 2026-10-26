/* eslint-disable typescript/unbound-method -- En specs es seguro referenciar mocks */
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { CreateAnswerProfileDto } from '../src/modules/answer-profiles/dto/create-answer-profile.dto';
import { UpdateAnswerProfileDto } from '../src/modules/answer-profiles/dto/update-answer-profile.dto';
import { CreateAnswerDto } from '../src/modules/answers/dto/create-answer.dto';
import { UpdateAnswerDto } from '../src/modules/answers/dto/update-answer.dto';
import { CreateDimensionDto } from '../src/modules/dimensions/dto/create-dimension.dto';
import { UpdateDimensionDto } from '../src/modules/dimensions/dto/update-dimension.dto';
import { CreateQuestionDto } from '../src/modules/questions/dto/create-question.dto';
import { UpdateQuestionDto } from '../src/modules/questions/dto/update-question.dto';

/**
 * Helper: ejecuta la pipeline real de class-transformer + class-validator
 * con la misma configuración que `ValidationPipe` de NestJS
 * (`transform: true`, `whitelist: true`). Garantiza que los tests prueban
 * el mismo flujo que en runtime, sin depender de mocks.
 */
async function validateDto<T extends object>(
  Dto: new () => T,
  plain: Record<string, unknown>,
): Promise<string[]> {
  const instance = plainToInstance(Dto, plain, { enableImplicitConversion: false });
  const errors = await validate(instance as object, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });
  return errors.flatMap((e) =>
    Object.values(e.constraints ?? {}).map((msg) => `${e.property}: ${msg}`),
  );
}

describe('DTOs: validación con class-validator (null + whitespace)', () => {
  // ----------------------------------------------------------------
  // CreateAnswerProfileDto
  // ----------------------------------------------------------------

  describe('CreateAnswerProfileDto', () => {
    const valid = { label: 'Likert 1-5' };

    it('acepta un label válido', async () => {
      expect(await validateDto(CreateAnswerProfileDto, valid)).toEqual([]);
    });

    it('rechaza label vacío', async () => {
      const errors = await validateDto(CreateAnswerProfileDto, { label: '' });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label de solo whitespace (trim → vacío)', async () => {
      const errors = await validateDto(CreateAnswerProfileDto, {
        label: '   ',
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label null', async () => {
      const errors = await validateDto(CreateAnswerProfileDto, {
        label: null,
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label undefined (campo requerido)', async () => {
      const errors = await validateDto(CreateAnswerProfileDto, {});
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label no-string', async () => {
      const errors = await validateDto(CreateAnswerProfileDto, {
        label: 123,
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // UpdateAnswerProfileDto
  // ----------------------------------------------------------------

  describe('UpdateAnswerProfileDto', () => {
    it('acepta objeto vacío (PATCH {} permitido por diseño)', async () => {
      expect(await validateDto(UpdateAnswerProfileDto, {})).toEqual([]);
    });

    it('acepta label válido', async () => {
      const errors = await validateDto(UpdateAnswerProfileDto, {
        label: 'Nuevo nombre',
      });
      expect(errors).toEqual([]);
    });

    it('rechaza label null (BUG QA: antes generaba SQL 500)', async () => {
      const errors = await validateDto(UpdateAnswerProfileDto, {
        label: null,
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label vacío', async () => {
      const errors = await validateDto(UpdateAnswerProfileDto, {
        label: '',
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label de solo whitespace', async () => {
      const errors = await validateDto(UpdateAnswerProfileDto, {
        label: '\t  \n',
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('recorta whitespace antes de validar (label con padding válido)', async () => {
      const instance = plainToInstance(UpdateAnswerProfileDto, {
        label: '  Likert 1-5  ',
      });
      expect(instance.label).toBe('Likert 1-5');
    });
  });

  // ----------------------------------------------------------------
  // CreateAnswerDto
  // ----------------------------------------------------------------

  describe('CreateAnswerDto', () => {
    const valid = {
      label: 'Totalmente de acuerdo',
      value: 3,
      answerProfileId: '00000000-0000-4000-8000-000000000001',
    };

    it('acepta un payload válido', async () => {
      expect(await validateDto(CreateAnswerDto, valid)).toEqual([]);
    });

    it('rechaza label whitespace', async () => {
      const errors = await validateDto(CreateAnswerDto, { ...valid, label: '   ' });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza value null', async () => {
      const errors = await validateDto(CreateAnswerDto, { ...valid, value: null });
      expect(errors.some((m) => /value/.test(m))).toBe(true);
    });

    it('rechaza sortOrder null', async () => {
      const errors = await validateDto(CreateAnswerDto, {
        ...valid,
        sortOrder: null,
      });
      expect(errors.some((m) => /sortOrder/.test(m))).toBe(true);
    });

    it('rechaza isActive null', async () => {
      const errors = await validateDto(CreateAnswerDto, {
        ...valid,
        isActive: null,
      });
      expect(errors.some((m) => /isActive/.test(m))).toBe(true);
    });

    it('rechaza answerProfileId null', async () => {
      const errors = await validateDto(CreateAnswerDto, {
        ...valid,
        answerProfileId: null,
      });
      expect(errors.some((m) => /answerProfileId/.test(m))).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // UpdateAnswerDto
  // ----------------------------------------------------------------

  describe('UpdateAnswerDto', () => {
    it('acepta objeto vacío', async () => {
      expect(await validateDto(UpdateAnswerDto, {})).toEqual([]);
    });

    it('rechaza label null', async () => {
      const errors = await validateDto(UpdateAnswerDto, { label: null });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label whitespace', async () => {
      const errors = await validateDto(UpdateAnswerDto, { label: '   ' });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza value null', async () => {
      const errors = await validateDto(UpdateAnswerDto, { value: null });
      expect(errors.some((m) => /value/.test(m))).toBe(true);
    });

    it('rechaza sortOrder null', async () => {
      const errors = await validateDto(UpdateAnswerDto, { sortOrder: null });
      expect(errors.some((m) => /sortOrder/.test(m))).toBe(true);
    });

    it('rechaza isActive null', async () => {
      const errors = await validateDto(UpdateAnswerDto, { isActive: null });
      expect(errors.some((m) => /isActive/.test(m))).toBe(true);
    });

    it('rechaza answerProfileId null', async () => {
      const errors = await validateDto(UpdateAnswerDto, {
        answerProfileId: null,
      });
      expect(errors.some((m) => /answerProfileId/.test(m))).toBe(true);
    });

    it('acepta label con padding (trim aplicado)', async () => {
      const instance = plainToInstance(UpdateAnswerDto, {
        label: '  Trimeado  ',
      });
      expect(instance.label).toBe('Trimeado');
    });
  });

  // ----------------------------------------------------------------
  // CreateDimensionDto
  // ----------------------------------------------------------------

  describe('CreateDimensionDto', () => {
    const valid = { label: 'Carga de trabajo' };

    it('acepta payload válido', async () => {
      expect(await validateDto(CreateDimensionDto, valid)).toEqual([]);
    });

    it('rechaza label whitespace', async () => {
      const errors = await validateDto(CreateDimensionDto, { label: '   ' });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label null', async () => {
      const errors = await validateDto(CreateDimensionDto, { label: null });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // UpdateDimensionDto
  // ----------------------------------------------------------------

  describe('UpdateDimensionDto', () => {
    it('acepta objeto vacío', async () => {
      expect(await validateDto(UpdateDimensionDto, {})).toEqual([]);
    });

    it('rechaza label null', async () => {
      const errors = await validateDto(UpdateDimensionDto, { label: null });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label whitespace', async () => {
      const errors = await validateDto(UpdateDimensionDto, { label: '\t\n ' });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza sortOrder null', async () => {
      const errors = await validateDto(UpdateDimensionDto, { sortOrder: null });
      expect(errors.some((m) => /sortOrder/.test(m))).toBe(true);
    });

    it('rechaza isActive null', async () => {
      const errors = await validateDto(UpdateDimensionDto, { isActive: null });
      expect(errors.some((m) => /isActive/.test(m))).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // CreateQuestionDto
  // ----------------------------------------------------------------

  describe('CreateQuestionDto', () => {
    const valid = {
      label: '¿Está sobrecargado?',
      dimensionId: '00000000-0000-4000-8000-000000000010',
      answerProfileId: '00000000-0000-4000-8000-000000000020',
    };

    it('acepta payload válido', async () => {
      expect(await validateDto(CreateQuestionDto, valid)).toEqual([]);
    });

    it('rechaza label whitespace', async () => {
      const errors = await validateDto(CreateQuestionDto, {
        ...valid,
        label: '   ',
      });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza dimensionId null', async () => {
      const errors = await validateDto(CreateQuestionDto, {
        ...valid,
        dimensionId: null,
      });
      expect(errors.some((m) => /dimensionId/.test(m))).toBe(true);
    });

    it('rechaza answerProfileId null', async () => {
      const errors = await validateDto(CreateQuestionDto, {
        ...valid,
        answerProfileId: null,
      });
      expect(errors.some((m) => /answerProfileId/.test(m))).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // UpdateQuestionDto
  // ----------------------------------------------------------------

  describe('UpdateQuestionDto', () => {
    it('acepta objeto vacío', async () => {
      expect(await validateDto(UpdateQuestionDto, {})).toEqual([]);
    });

    it('rechaza label null', async () => {
      const errors = await validateDto(UpdateQuestionDto, { label: null });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza label whitespace', async () => {
      const errors = await validateDto(UpdateQuestionDto, { label: '   ' });
      expect(errors.some((m) => /label/.test(m))).toBe(true);
    });

    it('rechaza dimensionId null', async () => {
      const errors = await validateDto(UpdateQuestionDto, {
        dimensionId: null,
      });
      expect(errors.some((m) => /dimensionId/.test(m))).toBe(true);
    });

    it('rechaza answerProfileId null', async () => {
      const errors = await validateDto(UpdateQuestionDto, {
        answerProfileId: null,
      });
      expect(errors.some((m) => /answerProfileId/.test(m))).toBe(true);
    });

    it('rechaza sortOrder null', async () => {
      const errors = await validateDto(UpdateQuestionDto, { sortOrder: null });
      expect(errors.some((m) => /sortOrder/.test(m))).toBe(true);
    });

    it('rechaza isRequired null', async () => {
      const errors = await validateDto(UpdateQuestionDto, { isRequired: null });
      expect(errors.some((m) => /isRequired/.test(m))).toBe(true);
    });

    it('rechaza isActive null', async () => {
      const errors = await validateDto(UpdateQuestionDto, { isActive: null });
      expect(errors.some((m) => /isActive/.test(m))).toBe(true);
    });
  });
});