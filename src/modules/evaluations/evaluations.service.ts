import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';

import { Answer } from '../answers/entities/answer.entity';
import { Dimension } from '../dimensions/entities/dimension.entity';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationResult } from '../results/entities/evaluation-result.entity';
import { Question } from '../questions/entities/question.entity';
import { QuestionAnswer } from '../question-answers/entities/question-answer.entity';

import { SurveyResponseDto } from './dto/survey-response.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { EvaluationResultsResponseDto } from './dto/evaluation-results-response.dto';
import { throwBadRequest, throwNotFound } from '../../common/throw-error';

interface ResolvedResponse {
  question: Question;
  answer: Answer;
}

@Injectable()
export class EvaluationsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Catálogo público de la encuesta activa:
   * dimensiones activas y sus preguntas activas ordenadas por sortOrder.
   * NO expone `value` (el puntaje) de las respuestas.
   */
  async getActiveSurvey(): Promise<SurveyResponseDto> {
    const dimensions = await this.dataSource.getRepository(Dimension).find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    if (dimensions.length === 0) {
      return { dimensions: [] };
    }

    const questions = await this.dataSource.getRepository(Question).find({
      where: { isActive: true, dimension: In(dimensions.map((d) => d.id)) },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
      relations: { dimension: true, answerProfile: true },
    });

    const questionIds = questions.map((q) => q.id);
    // Importante: necesitamos cargar la relación `answerProfile` para poder
    // agrupar las opciones por perfil y devolverlas en cada pregunta.
    // Sin `relations`, `a.answerProfile` sería `undefined` y la agrupación
    // quedaría vacía (bug detectado en QA: las opciones no aparecían).
    const answers = questionIds.length
      ? await this.dataSource.getRepository(Answer).find({
          where: {
            isActive: true,
            answerProfile: In(
              questions
                .map((q) => q.answerProfile?.id)
                .filter(Boolean) as string[],
            ),
          },
          relations: { answerProfile: true },
          order: { sortOrder: 'ASC', createdAt: 'ASC' },
        })
      : [];

    const answersByProfile = new Map<string, Answer[]>();
    for (const a of answers) {
      const pid = a.answerProfile?.id;
      if (!pid) continue;
      const list = answersByProfile.get(pid) ?? [];
      list.push(a);
      answersByProfile.set(pid, list);
    }

    const questionsByDimension = new Map<string, Question[]>();
    for (const q of questions) {
      const did = q.dimension?.id;
      if (!did) continue;
      const list = questionsByDimension.get(did) ?? [];
      list.push(q);
      questionsByDimension.set(did, list);
    }

    return {
      dimensions: dimensions.map((d) => ({
        id: d.id,
        label: d.label,
        sortOrder: d.sortOrder,
        questions: (questionsByDimension.get(d.id) ?? []).map((q) => ({
          id: q.id,
          label: q.label,
          helperText: q.helperText,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired,
          answers: (answersByProfile.get(q.answerProfile?.id ?? '') ?? []).map(
            (a) => ({
              id: a.id,
              label: a.label,
              sortOrder: a.sortOrder,
            }),
          ),
        })),
      })),
    };
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
   * IP, sin user-agent). El campo `Evaluation.workplace` permanece sin uso.
   */
  async submitEvaluation(dto: SubmitEvaluationDto): Promise<Evaluation> {
    // 1. Duplicados
    const seen = new Set<string>();
    for (const a of dto.answers) {
      if (seen.has(a.questionId)) {
        return throwBadRequest(
          `Question ${a.questionId} appears more than once in the answers array`,
        );
      }
      seen.add(a.questionId);
    }

    const questionIds = Array.from(seen);
    const answerIds = dto.answers.map((a) => a.answerId);

    // 2-4. Resolver preguntas y respuestas en batch
    const questions = await this.dataSource.getRepository(Question).find({
      where: { id: In(questionIds) },
      relations: { answerProfile: true, dimension: true },
    });
    const answers = await this.dataSource.getRepository(Answer).find({
      where: { id: In(answerIds) },
      relations: { answerProfile: true },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const answerMap = new Map(answers.map((a) => [a.id, a]));

    const resolved: ResolvedResponse[] = [];
    const missingQuestions: string[] = [];
    const inactiveQuestions: string[] = [];
    const missingAnswers: string[] = [];
    const inactiveAnswers: string[] = [];
    const profileMismatch: string[] = [];

    for (const input of dto.answers) {
      const question = questionMap.get(input.questionId);
      if (!question) {
        missingQuestions.push(input.questionId);
        continue;
      }
      if (!question.isActive) {
        inactiveQuestions.push(input.questionId);
        continue;
      }
      const answer = answerMap.get(input.answerId);
      if (!answer) {
        missingAnswers.push(input.answerId);
        continue;
      }
      if (!answer.isActive) {
        inactiveAnswers.push(input.answerId);
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
      profileMismatch.length
    ) {
      return throwBadRequest('Invalid evaluation answers', {
        missingQuestions,
        inactiveQuestions,
        missingAnswers,
        inactiveAnswers,
        profileMismatch,
      });
    }

    // 5. Conjunto canónico de IDs de dimensiones visibles en la encuesta
    //    pública (`getActiveSurvey`): activas Y no soft-deleted.
    //
    //    Bloqueador crítico detectado en QA real (TypeORM): un LEFT JOIN
    //    con la tabla `dimensions` añade `AND dimension.delete_at IS NULL`,
    //    dejando `question.dimension = null` para filas soft-deleted. El
    //    código anterior interpretaba `dim == null` como "pregunta huérfana
    //    → exigir respuesta", forzando al participante a contestar una
    //    pregunta cuya dimensión ya no existe en la encuesta pública
    //    visible.
    //
    //    Solución robusta: pedir a TypeORM los IDs de las dimensiones
    //    activas y NO soft-deleted (las mismas que expone la encuesta
    //    pública en `getActiveSurvey`), y luego filtrar las preguntas
    //    obligatorias con `dimension: In(activeDimensionIds)`. Esto
    //    garantiza que el conjunto de preguntas obligatorias exigidas es
    //    EXACTAMENTE el subconjunto de la encuesta visible. NO se acepta
    //    pregunta de dimensión soft-deleted ni inactiva.
    const activeDimensions = await this.dataSource
      .getRepository(Dimension)
      .find({
        where: { isActive: true },
        // `find()` respeta soft-delete: las dimensiones con `delete_at`
        // poblado quedan excluidas por defecto. Si en el futuro se hace
        // explícito con `.withDeleted(true)` se reconsidera este punto.
      });
    const activeDimensionIds = activeDimensions.map((d) => d.id);
    const activeDimensionIdSet = new Set(activeDimensionIds);

    // 6. Bloqueador detectado por QA: el flujo anterior validaba únicamente
    //    que la pregunta existiera y estuviera `isActive=true`. Eso permitía
    //    contestar preguntas activas de dimensiones INACTIVAS (se calculaba
    //    `EvaluationResult` aunque `GET /evaluations/survey` no las
    //    mostraba) o de dimensiones SOFT-DELETED (se persistía
    //    `QuestionAnswer` pero no se podía generar `EvaluationResult`).
    //    Solución: rechazar el envío entero con 400 si ALGUNA pregunta
    //    resuelta no pertenece al conjunto de IDs de dimensiones activas
    //    no borradas. Esta validación se ejecuta ANTES de abrir la
    //    transacción, garantizando que no se persiste nada.
    const questionsWithInvalidDimension: string[] = [];
    for (const { question } of resolved) {
      const dimId = question.dimension?.id;
      if (!dimId || !activeDimensionIdSet.has(dimId)) {
        questionsWithInvalidDimension.push(question.id);
      }
    }
    if (questionsWithInvalidDimension.length > 0) {
      throwBadRequest(
        'Answers for questions belonging to inactive or deleted dimensions are not allowed',
        {
          questionsWithInvalidDimension,
        },
      );
    }

    // 7. Verificar obligatoriedad de preguntas activas.
    const requiredQuestions =
      activeDimensionIds.length === 0
        ? []
        : await this.dataSource.getRepository(Question).find({
            where: {
              isRequired: true,
              isActive: true,
              dimension: In(activeDimensionIds),
            },
            // NO se cargan relaciones: la decisión de obligatoriedad se
            // toma exclusivamente por pertenencia al conjunto de IDs
            // activos. Esto evita el LEFT JOIN que filtraba por
            // `delete_at IS NULL` y provocaba el bug.
          });
    const answeredIds = new Set(resolved.map((r) => r.question.id));
    const unansweredRequired = requiredQuestions.filter(
      (q) => !answeredIds.has(q.id),
    );
    if (unansweredRequired.length > 0) {
      return throwBadRequest('Required questions without answers', {
        unansweredRequired: unansweredRequired.map((q) => q.id),
      });
    }

    // Persistencia transaccional
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const evalRepo = manager.getRepository(Evaluation);
      const qaRepo = manager.getRepository(QuestionAnswer);
      const resultRepo = manager.getRepository(EvaluationResult);

      const evaluation = evalRepo.create({});
      // No tocamos `workplace` (campo legacy no usado por el flujo anónimo).
      await evalRepo.save(evaluation);

      const qaEntities = resolved.map(({ question, answer }) =>
        qaRepo.create({
          evaluation,
          question,
          answer,
        }),
      );
      if (qaEntities.length > 0) {
        await qaRepo.save(qaEntities);
      }

      // Sumar `Answer.value` por dimensión
      const scoreByDimension = new Map<
        string,
        { dim: Dimension; score: number }
      >();
      for (const { question, answer } of resolved) {
        const dim = question.dimension;
        if (!dim) continue; // No debería ocurrir si el schema es consistente.
        const current = scoreByDimension.get(dim.id) ?? { dim, score: 0 };
        current.score += answer.value;
        scoreByDimension.set(dim.id, current);
      }

      const resultEntities: EvaluationResult[] = [];
      for (const { dim, score } of scoreByDimension.values()) {
        resultEntities.push(
          resultRepo.create({
            evaluation,
            dimension: dim,
            score,
            // Clasificación intencionalmente null hasta que el dominio defina rangos.
            classification: null,
          }),
        );
      }
      if (resultEntities.length > 0) {
        await resultRepo.save(resultEntities);
      }

      return evaluation;
    });
  }

  /**
   * Devuelve el puntaje bruto por dimensión de una evaluación.
   *
   * NO inventa clasificaciones: si `EvaluationResult.classification` es null,
   * así se devuelve. Cada dimensión con respuesta guardada tiene un único
   * resultado.
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
}
