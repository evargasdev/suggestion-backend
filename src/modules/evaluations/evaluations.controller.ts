import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Evaluation } from './entities/evaluation.entity';
import { EvaluationCreatedResponseDto } from './dto/evaluation-created-response.dto';
import { EvaluationResultsResponseDto } from './dto/evaluation-results-response.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { SurveyResponseDto } from './dto/survey-response.dto';
import { EvaluationsService } from './evaluations.service';

@ApiTags('Evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly service: EvaluationsService) {}

  /**
   * Catálogo público de la encuesta activa. NO devuelve `value` de las
   * respuestas. Se usa para renderizar el formulario al participante.
   */
  @Get('survey')
  @ApiOperation({
    summary: 'Obtener catálogo público de la encuesta activa',
    description:
      'Devuelve dimensiones y preguntas activas (ordenadas por sortOrder) con sus opciones. NO expone el valor (score) de las opciones.',
  })
  @ApiOkResponse({ type: SurveyResponseDto })
  getActiveSurvey(): Promise<SurveyResponseDto> {
    return this.service.getActiveSurvey();
  }

  /**
   * Envío anónimo de una evaluación. Valida IDs, ausencia de duplicados,
   * preguntas activas, opciones existentes y activas, asociación de
   * answerProfile y obligatoriedad. Devuelve únicamente id y fecha.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar evaluación anónima',
    description:
      'Persiste la evaluación, las respuestas y los puntajes por dimensión en una sola transacción. No captura IP, user-agent ni datos personales.',
  })
  @ApiCreatedResponse({ type: EvaluationCreatedResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async submit(
    @Body() dto: SubmitEvaluationDto,
  ): Promise<EvaluationCreatedResponseDto> {
    const entity = await this.service.submitEvaluation(dto);
    return EvaluationCreatedResponseDto.fromEntity(entity);
  }

  /**
   * Devuelve el puntaje bruto por dimensión para una evaluación.
   * La clasificación se devuelve solo si está definida (hoy siempre null).
   */
  @Get(':id/results')
  @ApiOperation({ summary: 'Obtener puntajes por dimensión de una evaluación' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EvaluationResultsResponseDto })
  @ApiNotFoundResponse({ description: 'Evaluación no encontrada' })
  getResults(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<EvaluationResultsResponseDto> {
    return this.service.getResults(id);
  }
}

/**
 * Tipo de retorno público de la creación, re-exportado para uso en tests.
 */
export type CreatedEvaluation = Evaluation;
