import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager } from 'typeorm';
import ExcelJS from 'exceljs';

import { Answer } from '../answers/entities/answer.entity';
import { Dimension } from '../dimensions/entities/dimension.entity';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationResult } from '../results/entities/evaluation-result.entity';
import { Question } from '../questions/entities/question.entity';
import { QuestionAnswer } from '../question-answers/entities/question-answer.entity';

import { SurveyResponseDto } from './dto/survey-response.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { EvaluationResultsResponseDto } from './dto/evaluation-results-response.dto';
import { DashboardStatDto } from './dto/dashboard-stat.dto';
import { throwBadRequest, throwNotFound } from '../../common/throw-error';
import {
  calculateDimensionResults,
  validateEvaluationAnswers,
} from './survey-scoring';

// Public dashboard privacy threshold; tune here if the disclosure policy changes.
const MINIMUM_PUBLIC_GROUP_SIZE = 5;
const DEFAULT_SURVEY_CACHE_TTL_MS = 60_000;
const configuredSurveyCacheTtl = process.env.ACTIVE_SURVEY_CACHE_TTL_MS;
const ACTIVE_SURVEY_CACHE_TTL_MS =
  configuredSurveyCacheTtl === undefined
    ? DEFAULT_SURVEY_CACHE_TTL_MS
    : Number(configuredSurveyCacheTtl);

if (
  !Number.isFinite(ACTIVE_SURVEY_CACHE_TTL_MS) ||
  ACTIVE_SURVEY_CACHE_TTL_MS < 0
) {
  throw new Error(
    'ACTIVE_SURVEY_CACHE_TTL_MS must be a non-negative number of milliseconds',
  );
}

interface DashboardViewRow {
  sector: string;
  position: string;
  dimension_id: string;
  dimension_label: string;
  promedio_puntaje: string | number;
  total_evaluaciones: string | number;
}

interface ActiveSurveyRow {
  dimension_id: string;
  dimension_label: string;
  dimension_sort_order: number;
  question_id: string | null;
  question_label: string | null;
  question_helper_text: string | null;
  question_sort_order: number | null;
  question_is_required: boolean | null;
  answer_id: string | null;
  answer_label: string | null;
  answer_sort_order: number | null;
  answer_is_not_applicable: boolean | null;
}

const CARE_DIMENSION_LABEL = 'Cuidados y corresponsabilidad';

@Injectable()
export class EvaluationsService {
  private surveyCache?: SurveyResponseDto;
  private surveyCacheExpiresAt = 0;
  private surveyCachePromise?: Promise<SurveyResponseDto>;
  private surveyCacheVersion = 0;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Catálogo público de la encuesta activa:
   * dimensiones activas y sus preguntas activas ordenadas por sortOrder.
   * NO expone `value` (el puntaje) de las respuestas.
   */
  async getActiveSurvey(): Promise<SurveyResponseDto> {
    if (ACTIVE_SURVEY_CACHE_TTL_MS === 0) {
      return this.loadActiveSurvey();
    }

    if (this.surveyCache && Date.now() < this.surveyCacheExpiresAt) {
      return structuredClone(this.surveyCache);
    }
    if (this.surveyCachePromise) {
      return structuredClone(await this.surveyCachePromise);
    }

    const cacheVersion = this.surveyCacheVersion;
    const loadPromise = this.loadActiveSurvey()
      .then((survey) => {
        if (cacheVersion === this.surveyCacheVersion) {
          this.surveyCache = survey;
          this.surveyCacheExpiresAt = Date.now() + ACTIVE_SURVEY_CACHE_TTL_MS;
        }
        return survey;
      })
      .finally(() => {
        if (this.surveyCachePromise === loadPromise) {
          this.surveyCachePromise = undefined;
        }
      });
    this.surveyCachePromise = loadPromise;
    return structuredClone(await loadPromise);
  }

  invalidateSurveyCache(): void {
    this.surveyCacheVersion += 1;
    this.surveyCache = undefined;
    this.surveyCacheExpiresAt = 0;
    this.surveyCachePromise = undefined;
  }

  private async loadActiveSurvey(): Promise<SurveyResponseDto> {
    const rows: ActiveSurveyRow[] = await this.dataSource
      .getRepository(Dimension)
      .createQueryBuilder('dimension')
      .leftJoin(
        'dimension.questions',
        'question',
        'question.isActive = :questionActive AND question.deletedAt IS NULL',
        { questionActive: true },
      )
      .leftJoin('question.answerProfile', 'answerProfile')
      .leftJoin(
        'answerProfile.answers',
        'answer',
        'answer.isActive = :answerActive AND answer.deletedAt IS NULL',
        { answerActive: true },
      )
      .select('dimension.id', 'dimension_id')
      .addSelect('dimension.label', 'dimension_label')
      .addSelect('dimension.sortOrder', 'dimension_sort_order')
      .addSelect('question.id', 'question_id')
      .addSelect('question.label', 'question_label')
      .addSelect('question.helperText', 'question_helper_text')
      .addSelect('question.sortOrder', 'question_sort_order')
      .addSelect('question.isRequired', 'question_is_required')
      .addSelect('answer.id', 'answer_id')
      .addSelect('answer.label', 'answer_label')
      .addSelect('answer.sortOrder', 'answer_sort_order')
      .addSelect('answer.isNotApplicable', 'answer_is_not_applicable')
      .where('dimension.isActive = :dimensionActive', {
        dimensionActive: true,
      })
      .andWhere('dimension.deletedAt IS NULL')
      .orderBy('dimension.sortOrder', 'ASC')
      .addOrderBy('dimension.createdAt', 'ASC')
      .addOrderBy('question.sortOrder', 'ASC')
      .addOrderBy('question.createdAt', 'ASC')
      .addOrderBy('answer.sortOrder', 'ASC')
      .addOrderBy('answer.createdAt', 'ASC')
      .getRawMany<ActiveSurveyRow>();

    const dimensionsById = new Map<
      string,
      SurveyResponseDto['dimensions'][number]
    >();
    const questionsByDimension = new Map<
      string,
      Map<string, SurveyResponseDto['dimensions'][number]['questions'][number]>
    >();

    for (const row of rows) {
      let dimension = dimensionsById.get(row.dimension_id);
      if (!dimension) {
        dimension = {
          id: row.dimension_id,
          label: row.dimension_label,
          sortOrder: row.dimension_sort_order,
          questions: [],
        };
        dimensionsById.set(row.dimension_id, dimension);
        questionsByDimension.set(row.dimension_id, new Map());
      }

      if (!row.question_id) continue;
      const questions = questionsByDimension.get(row.dimension_id)!;
      let question = questions.get(row.question_id);
      if (!question) {
        question = {
          id: row.question_id,
          label: row.question_label ?? '',
          helperText: row.question_helper_text ?? '',
          sortOrder: row.question_sort_order ?? 0,
          isRequired: row.question_is_required ?? false,
          answers: [],
        };
        questions.set(row.question_id, question);
        dimension.questions.push(question);
      }

      if (
        row.answer_id &&
        (!row.answer_is_not_applicable ||
          dimension.label === CARE_DIMENSION_LABEL)
      ) {
        question.answers.push({
          id: row.answer_id,
          label: row.answer_label ?? '',
          sortOrder: row.answer_sort_order ?? 0,
          isNotApplicable: row.answer_is_not_applicable ?? false,
        });
      }
    }

    return { dimensions: Array.from(dimensionsById.values()) };
  }

  /**
   * Envío anónimo de evaluación.
   *
   * Validaciones (en este orden, mensajes claros para 400):
   *  1. Sin questionId repetido.
   *  2. Todas las preguntas existen y están activas.
   *  3. Todas las opciones existen y están activas.
   *  4. Cada opción pertenece al answerProfile de su pregunta.
   *  5. TODA pregunta enviada pertenece a una dimensión activa Y no
   *     soft-deleted (mismo conjunto que expone `GET /evaluations/survey`).
   *     Si alguna falla, el envío entero se rechaza con 400 ANTES de
   *     persistir cualquier cosa.
   *  6. Todas las preguntas activas obligatorias (`isRequired && isActive`)
   *     reciben una respuesta.
   *
   * Persistencia transaccional:
   *  - 1 `Evaluation`
   *  - N `QuestionAnswer` (uno por respuesta)
   *  - 1 `EvaluationResult` por dimensión con al menos una respuesta.
   *
   * No se persiste ningún dato identificador del participante (sin auth, sin
   * IP, sin user-agent).
   */
  async submitEvaluation(dto: SubmitEvaluationDto): Promise<Evaluation> {
    const questionIds = Array.from(
      new Set(dto.answers.map((answer) => answer.questionId)),
    );
    const answerIds = Array.from(
      new Set(dto.answers.map((answer) => answer.answerId)),
    );

    const [activeDimensions, questions, answers] = await Promise.all([
      this.dataSource.getRepository(Dimension).find({
        select: { id: true },
        where: { isActive: true },
      }),
      this.loadQuestionsForEvaluation(questionIds),
      this.loadAnswersForEvaluation(answerIds),
    ]);

    const activeDimensionIds = new Set(
      activeDimensions.map((dimension) => dimension.id),
    );
    const validation = validateEvaluationAnswers(
      dto.answers,
      questions,
      answers,
      activeDimensionIds,
    );
    if (!validation.valid) {
      return throwBadRequest(
        validation.error.message,
        validation.error.details,
      );
    }

    const { resolved, requiredQuestions } = validation;
    const dimensionResults = calculateDimensionResults(
      resolved,
      requiredQuestions,
    );

    // Persistencia transaccional
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const evalRepo = manager.getRepository(Evaluation);
      const qaRepo = manager.getRepository(QuestionAnswer);

      const evaluation = evalRepo.create({
        ageRange: dto.demographics.ageRange,
        genderIdentity: dto.demographics.genderIdentity,
        vulnerableGroups: dto.demographics.vulnerableGroups,
        origin: dto.demographics.origin,
        hasCareResponsibilities: dto.demographics.hasCareResponsibilities,
        careResponsibilitiesDetails:
          dto.demographics.careResponsibilitiesDetails,
        activityType: dto.demographics.activityType,
        sector: dto.demographics.sector,
        position: dto.demographics.position,
      });
      await evalRepo.save(evaluation);

      if (resolved.length > 0) {
        await qaRepo.insert(
          resolved.map(({ question, answer }) => ({
            evaluation: { id: evaluation.id },
            question: { id: question.id },
            answer: { id: answer.id },
          })),
        );
      }

      if (dimensionResults.length > 0) {
        await manager.getRepository(EvaluationResult).insert(
          dimensionResults.map((result) => ({
            evaluation: { id: evaluation.id },
            dimension: { id: result.dimensionId },
            score: result.score,
            classification: result.classification,
          })),
        );
      }

      return evaluation;
    });
  }

  private loadQuestionsForEvaluation(
    submittedQuestionIds: string[],
  ): Promise<Question[]> {
    const query = this.dataSource
      .getRepository(Question)
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.dimension', 'dimension')
      .leftJoinAndSelect('question.answerProfile', 'answerProfile')
      .select([
        'question.id',
        'question.isActive',
        'question.isRequired',
        'dimension.id',
        'dimension.label',
        'answerProfile.id',
      ])
      .where(
        new Brackets((qb) => {
          qb.where(
            'question.isActive = :active AND dimension.isActive = :active',
            { active: true },
          );
          if (submittedQuestionIds.length > 0) {
            qb.orWhere('question.id IN (:...submittedQuestionIds)', {
              submittedQuestionIds,
            });
          }
        }),
      );

    return query.getMany();
  }

  private loadAnswersForEvaluation(answerIds: string[]): Promise<Answer[]> {
    if (answerIds.length === 0) return Promise.resolve([]);

    return this.dataSource
      .getRepository(Answer)
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.answerProfile', 'answerProfile')
      .select([
        'answer.id',
        'answer.isActive',
        'answer.value',
        'answer.isNotApplicable',
        'answerProfile.id',
      ])
      .where('answer.id IN (:...answerIds)', { answerIds })
      .getMany();
  }

  /**
   * Devuelve el puntaje normalizado y la clasificación por dimensión.
   *
   * Cada dimensión con respuestas puntuables tiene un resultado. La
   * clasificación usa las bandas definidas en el instrumento.
   */
  async getResults(id: string): Promise<EvaluationResultsResponseDto> {
    const evaluation = await this.dataSource
      .getRepository(Evaluation)
      .findOne({ where: { id } });
    if (!evaluation) {
      return throwNotFound(`Evaluation ${id} not found`);
    }

    // Importante: usamos `.withDeleted()` para incluir dimensiones que fueron
    // borradas lógicamente DESPUÉS de persistir la evaluación. Sin el flag,
    // TypeORM añade `AND dimension.delete_at IS NULL` al JOIN y los
    // resultados históricos desaparecen (provocando `r.dimension.id`
    // undefined → TypeError). Mantener la fila histórica accesible para
    // auditoría incluso si la dimensión se desactivó/soft-deleteó.
    //
    // Bloqueador crítico detectado en QA real (TypeORM 1.1): hay que
    // invocar `.withDeleted()` ANTES de `.leftJoinAndSelect()`. Si se
    // hace al final, TypeORM fija la política de borrado DESPUÉS de
    // añadir los joins, por lo que la entidad relacionada sigue
    // generando el predicado `delete_at IS NULL` en el JOIN. Resultado:
    // `r.dimension` llega como `null` para dimensiones soft-deleted y se
    // pierde `dimensionLabel`/`dimensionId` en la respuesta histórica.
    //
    // Además, `.withDeleted()` desactiva el filtro `delete_at IS NULL`
    // también para la entidad raíz `result`, lo que devolvería filas de
    // `EvaluationResult` soft-deleted. Se compensa con un `andWhere`
    // explícito sobre `result.delete_at` (columna definida en `Base`,
    // nombre confirmado: `delete_at`). Así: dimensiones borradas
    // incluidas en el JOIN, pero `EvaluationResult` soft-deleted
    // excluidas del resultado.
    const results = await this.dataSource
      .getRepository(EvaluationResult)
      .createQueryBuilder('result')
      .withDeleted()
      .leftJoinAndSelect('result.dimension', 'dimension')
      .where('result.evaluation_id = :id', { id })
      .andWhere('result.delete_at IS NULL')
      .orderBy('dimension.sortOrder', 'ASC')
      .getMany();

    return {
      evaluationId: evaluation.id,
      results: results.map((r) => ({
        dimensionId: r.dimension?.id ?? '',
        dimensionLabel: r.dimension?.label ?? '',
        score: r.score,
        classification: r.classification ?? null,
      })),
    };
  }

  async getDashboardStats(): Promise<DashboardStatDto[]> {
    const rows: DashboardViewRow[] = await this.dataSource.query(
      `SELECT
         "sector",
         "position",
         "dimension_id",
         "dimension_label",
         "promedio_puntaje",
         "total_evaluaciones"
       FROM "vw_dashboard_stats"
       ORDER BY "sector", "position", "dimension_label"`,
    );

    return rows.map((row) => ({
      sector: row.sector,
      position: row.position,
      dimensionId: row.dimension_id,
      dimensionLabel: row.dimension_label,
      averageScore: Number(row.promedio_puntaje),
      evaluationCount: Number(row.total_evaluaciones),
    }));
  }

  async createDashboardWorkbook(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Suggestion API';
    const sheet = workbook.addWorksheet('Resultados agregados');
    sheet.columns = [
      { header: 'Sector', key: 'sector', width: 24 },
      { header: 'Cargo', key: 'position', width: 32 },
      { header: 'Dimensión', key: 'dimensionLabel', width: 32 },
      {
        header: 'Promedio de puntaje',
        key: 'averageScore',
        width: 22,
        style: { numFmt: '0.00' },
      },
      { header: 'Evaluaciones', key: 'evaluationCount', width: 18 },
    ];
    sheet.addRows(await this.getDashboardStats());
    sheet.getRow(1).font = { bold: true };
    sheet.autoFilter = 'A1:E1';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}
