import {
  calculateDimensionResults,
  classifyDimensionScore,
  EvaluationAnswer,
  EvaluationQuestion,
  normalizeDimensionScore,
  validateEvaluationAnswers,
} from './survey-scoring';

const profile = { id: 'profile-1' };
const activeDimension = {
  id: 'dimension-1',
  label: 'Laboral',
};

function makeQuestion(
  overrides: Partial<EvaluationQuestion> = {},
): EvaluationQuestion {
  return {
    id: 'question-1',
    isActive: true,
    isRequired: true,
    answerProfile: profile,
    dimension: activeDimension,
    ...overrides,
  };
}

function makeAnswer(
  overrides: Partial<EvaluationAnswer> = {},
): EvaluationAnswer {
  return {
    id: 'answer-1',
    isActive: true,
    value: 5,
    isNotApplicable: false,
    answerProfile: profile,
    ...overrides,
  };
}

describe('survey scoring', () => {
  it.each([
    ['Laboral', 9, 'Condiciones laborales desfavorables'],
    ['Laboral', 10, 'Condiciones laborales parcialmente favorables'],
    ['Laboral', 19, 'Condiciones laborales favorables'],
    ['Discriminación', 7, 'Condiciones laborales desfavorables'],
    ['Discriminación', 8, 'Condiciones laborales parcialmente favorables'],
    ['Discriminación', 15, 'Condiciones laborales favorables'],
    ['Violencias', 27, 'Condiciones laborales favorables'],
    [
      'Cuidados y corresponsabilidad',
      11,
      'Condiciones laborales parcialmente favorables',
    ],
    ['Salud física y mental', 12, 'Condiciones laborales favorables'],
  ])('classifies %s score %i', (dimension, score, expected) => {
    expect(classifyDimensionScore(dimension, score)).toBe(expected);
  });

  it('normalizes scores when answers do not apply', () => {
    expect(normalizeDimensionScore(9, 6, 5)).toBe(11);
    expect(normalizeDimensionScore(9, 6, 6)).toBe(9);
    expect(normalizeDimensionScore(0, 6, 0)).toBeNull();
  });

  it('leaves scores unclassified outside a known range', () => {
    expect(classifyDimensionScore('Unknown', 2)).toBeNull();
    expect(classifyDimensionScore('Laboral', 28)).toBeNull();
  });

  it.each([
    ['soft-deleted', null],
    ['inactive', { id: 'inactive-dimension', label: 'Laboral' }],
  ])('rejects submitted questions from %s dimensions', (_, dimension) => {
    const result = validateEvaluationAnswers(
      [{ questionId: 'question-1', answerId: 'answer-1' }],
      [makeQuestion({ dimension })],
      [makeAnswer()],
      new Set([activeDimension.id]),
    );

    expect(result).toMatchObject({
      valid: false,
      error: {
        message:
          'Answers for questions belonging to inactive or deleted dimensions are not allowed',
        details: { questionsWithInvalidDimension: ['question-1'] },
      },
    });
  });

  it.each([
    ['Laboral', false],
    ['Cuidados y corresponsabilidad', true],
  ])(
    'allows "No aplica" only for the care dimension (%s)',
    (label, allowed) => {
      const question = makeQuestion({
        dimension: { id: 'dimension-1', label },
      });
      const result = validateEvaluationAnswers(
        [{ questionId: question.id, answerId: 'answer-1' }],
        [question],
        [makeAnswer({ isNotApplicable: true })],
        new Set([question.dimension!.id]),
      );

      if (allowed) {
        expect(result.valid).toBe(true);
      } else {
        expect(result).toMatchObject({
          valid: false,
          error: {
            message: 'Invalid evaluation answers',
            details: { invalidNotApplicable: ['question-1'] },
          },
        });
      }
    },
  );

  it('requires every active required question in active dimensions', () => {
    const result = validateEvaluationAnswers(
      [{ questionId: 'question-1', answerId: 'answer-1' }],
      [
        makeQuestion(),
        makeQuestion({ id: 'question-2' }),
        makeQuestion({
          id: 'deleted-dimension-question',
          dimension: null,
        }),
      ],
      [makeAnswer()],
      new Set([activeDimension.id]),
    );

    expect(result).toMatchObject({
      valid: false,
      error: {
        message: 'Required questions without answers',
        details: { unansweredRequired: ['question-2'] },
      },
    });
  });

  it('does not score "No aplica" and normalizes against required questions', () => {
    const question = makeQuestion();
    const secondQuestion = makeQuestion({ id: 'question-2' });
    const result = calculateDimensionResults(
      [
        { question, answer: makeAnswer({ value: 9 }) },
        {
          question: secondQuestion,
          answer: makeAnswer({
            id: 'answer-2',
            value: 0,
            isNotApplicable: true,
          }),
        },
      ],
      [question, secondQuestion],
    );

    expect(result).toEqual([
      {
        dimensionId: activeDimension.id,
        dimensionLabel: activeDimension.label,
        score: 18,
        classification: 'Condiciones laborales parcialmente favorables',
      },
    ]);
  });

  it('does not create a dimension score when every answer is not applicable', () => {
    const question = makeQuestion({
      dimension: {
        id: 'care-dimension',
        label: 'Cuidados y corresponsabilidad',
      },
    });

    expect(
      calculateDimensionResults(
        [
          {
            question,
            answer: makeAnswer({ isNotApplicable: true }),
          },
        ],
        [question],
      ),
    ).toEqual([]);
  });
});
