export interface EvaluationAnswerInput {
  questionId: string;
  answerId: string;
}

export interface EvaluationQuestion {
  id: string;
  isActive: boolean;
  isRequired: boolean;
  answerProfile?: { id: string } | null;
  dimension?: { id: string; label: string } | null;
}

export interface EvaluationAnswer {
  id: string;
  isActive: boolean;
  value: number;
  isNotApplicable: boolean;
  answerProfile?: { id: string } | null;
}

export interface ResolvedEvaluationAnswer {
  question: EvaluationQuestion;
  answer: EvaluationAnswer;
}

export interface EvaluationValidationError {
  message: string;
  details?: unknown;
}

export type EvaluationValidationResult =
  | {
      valid: true;
      resolved: ResolvedEvaluationAnswer[];
      requiredQuestions: EvaluationQuestion[];
    }
  | { valid: false; error: EvaluationValidationError };

export interface CalculatedDimensionResult {
  dimensionId: string;
  dimensionLabel: string;
  score: number;
  classification: string | null;
}

const CARE_DIMENSION_LABEL = 'Cuidados y corresponsabilidad';

const classificationBands: Record<
  string,
  Array<{ max: number; label: string }>
> = {
  Laboral: [
    { max: 9, label: 'Condiciones laborales desfavorables' },
    { max: 18, label: 'Condiciones laborales parcialmente favorables' },
    { max: 27, label: 'Condiciones laborales favorables' },
  ],
  Discriminación: [
    { max: 7, label: 'Condiciones laborales desfavorables' },
    { max: 14, label: 'Condiciones laborales parcialmente favorables' },
    { max: 21, label: 'Condiciones laborales favorables' },
  ],
  Violencias: [
    { max: 9, label: 'Condiciones laborales desfavorables' },
    { max: 18, label: 'Condiciones laborales parcialmente favorables' },
    { max: 27, label: 'Condiciones laborales favorables' },
  ],
  'Cuidados y corresponsabilidad': [
    { max: 6, label: 'Condiciones laborales desfavorables' },
    { max: 11, label: 'Condiciones laborales parcialmente favorables' },
    { max: 18, label: 'Condiciones laborales favorables' },
  ],
  'Salud física y mental': [
    { max: 6, label: 'Condiciones laborales desfavorables' },
    { max: 11, label: 'Condiciones laborales parcialmente favorables' },
    { max: 18, label: 'Condiciones laborales favorables' },
  ],
};

export function validateEvaluationAnswers(
  inputs: EvaluationAnswerInput[],
  questions: EvaluationQuestion[],
  answers: EvaluationAnswer[],
  activeDimensionIds: ReadonlySet<string>,
): EvaluationValidationResult {
  const seenQuestionIds = new Set<string>();
  for (const input of inputs) {
    if (seenQuestionIds.has(input.questionId)) {
      return {
        valid: false,
        error: {
          message: `Question ${input.questionId} appears more than once in the answers array`,
        },
      };
    }
    seenQuestionIds.add(input.questionId);
  }

  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const answerById = new Map(answers.map((answer) => [answer.id, answer]));
  const resolved: ResolvedEvaluationAnswer[] = [];
  const missingQuestions: string[] = [];
  const inactiveQuestions: string[] = [];
  const missingAnswers: string[] = [];
  const inactiveAnswers: string[] = [];
  const profileMismatch: string[] = [];
  const invalidNotApplicable: string[] = [];

  for (const input of inputs) {
    const question = questionById.get(input.questionId);
    if (!question) {
      missingQuestions.push(input.questionId);
      continue;
    }
    if (!question.isActive) {
      inactiveQuestions.push(input.questionId);
      continue;
    }

    const answer = answerById.get(input.answerId);
    if (!answer) {
      missingAnswers.push(input.answerId);
      continue;
    }
    if (!answer.isActive) {
      inactiveAnswers.push(input.answerId);
      continue;
    }
    if (
      answer.isNotApplicable &&
      question.dimension?.label !== CARE_DIMENSION_LABEL
    ) {
      invalidNotApplicable.push(input.questionId);
      continue;
    }
    if (
      !question.answerProfile ||
      !answer.answerProfile ||
      question.answerProfile.id !== answer.answerProfile.id
    ) {
      profileMismatch.push(input.questionId);
      continue;
    }
    resolved.push({ question, answer });
  }

  if (
    missingQuestions.length ||
    inactiveQuestions.length ||
    missingAnswers.length ||
    inactiveAnswers.length ||
    profileMismatch.length ||
    invalidNotApplicable.length
  ) {
    return {
      valid: false,
      error: {
        message: 'Invalid evaluation answers',
        details: {
          missingQuestions,
          inactiveQuestions,
          missingAnswers,
          inactiveAnswers,
          profileMismatch,
          invalidNotApplicable,
        },
      },
    };
  }

  const questionsWithInvalidDimension = resolved
    .filter(({ question }) => {
      const dimensionId = question.dimension?.id;
      return !dimensionId || !activeDimensionIds.has(dimensionId);
    })
    .map(({ question }) => question.id);

  if (questionsWithInvalidDimension.length > 0) {
    return {
      valid: false,
      error: {
        message:
          'Answers for questions belonging to inactive or deleted dimensions are not allowed',
        details: { questionsWithInvalidDimension },
      },
    };
  }

  const requiredQuestions = questions.filter(
    (question) =>
      question.isActive &&
      question.isRequired &&
      !!question.dimension &&
      activeDimensionIds.has(question.dimension.id),
  );
  const answeredQuestionIds = new Set(
    resolved.map(({ question }) => question.id),
  );
  const unansweredRequired = requiredQuestions.filter(
    (question) => !answeredQuestionIds.has(question.id),
  );

  if (unansweredRequired.length > 0) {
    return {
      valid: false,
      error: {
        message: 'Required questions without answers',
        details: {
          unansweredRequired: unansweredRequired.map((question) => question.id),
        },
      },
    };
  }

  return { valid: true, resolved, requiredQuestions };
}

export function calculateDimensionResults(
  resolved: ResolvedEvaluationAnswer[],
  requiredQuestions: EvaluationQuestion[],
): CalculatedDimensionResult[] {
  const scoreByDimension = new Map<
    string,
    {
      dimension: { id: string; label: string };
      score: number;
      scoredAnswers: number;
    }
  >();

  for (const { question, answer } of resolved) {
    const dimension = question.dimension;
    if (!dimension) continue;

    const current = scoreByDimension.get(dimension.id) ?? {
      dimension,
      score: 0,
      scoredAnswers: 0,
    };
    if (!answer.isNotApplicable) {
      current.score += answer.value;
      current.scoredAnswers += 1;
    }
    scoreByDimension.set(dimension.id, current);
  }

  const totalQuestionsByDimension = new Map<string, number>();
  for (const question of requiredQuestions) {
    const dimensionId = question.dimension?.id;
    if (dimensionId) {
      totalQuestionsByDimension.set(
        dimensionId,
        (totalQuestionsByDimension.get(dimensionId) ?? 0) + 1,
      );
    }
  }

  const results: CalculatedDimensionResult[] = [];
  for (const { dimension, score, scoredAnswers } of scoreByDimension.values()) {
    const comparableScore = normalizeDimensionScore(
      score,
      totalQuestionsByDimension.get(dimension.id) ?? 0,
      scoredAnswers,
    );
    if (comparableScore === null) continue;

    results.push({
      dimensionId: dimension.id,
      dimensionLabel: dimension.label,
      score: comparableScore,
      classification: classifyDimensionScore(dimension.label, comparableScore),
    });
  }

  return results;
}

export function classifyDimensionScore(
  dimensionLabel: string,
  score: number,
): string | null {
  const bands = classificationBands[dimensionLabel];
  return bands?.find((band) => score <= band.max)?.label ?? null;
}

export function normalizeDimensionScore(
  score: number,
  totalQuestions: number,
  scoredAnswers: number,
): number | null {
  if (scoredAnswers === 0) return null;
  if (scoredAnswers >= totalQuestions) return score;
  return Math.round((score * totalQuestions) / scoredAnswers);
}
