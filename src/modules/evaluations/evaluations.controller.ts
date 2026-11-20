import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { Evaluation } from './entities/evaluation.entity';
import { EvaluationCreatedResponseDto } from './dto/evaluation-created-response.dto';
import { EvaluationResultsResponseDto } from './dto/evaluation-results-response.dto';
import { DashboardStatDto } from './dto/dashboard-stat.dto';
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

  @Get('dashboard')
  @ApiOperation({
    summary: 'Obtener estadísticas agregadas del panel público',
    description:
      'Devuelve únicamente grupos con al menos cinco evaluaciones; no expone registros individuales.',
  })
  @ApiOkResponse({ type: DashboardStatDto, isArray: true })
  getDashboardStats(): Promise<DashboardStatDto[]> {
    return this.service.getDashboardStats();
  }

  @Get('dashboard/report.xlsx')
  @ApiOperation({
    summary: 'Descargar el reporte agregado del panel en Excel',
    description:
      'El archivo contiene los mismos agregados protegidos por tamaño mínimo de grupo que el panel.',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({
    schema: { type: 'string', format: 'binary' },
  })
  async downloadDashboardReport(@Res() response: Response): Promise<void> {
    const workbook = await this.service.createDashboardWorkbook();
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="resultados-turismo-mujeres.xlsx"',
    );
    response.setHeader('Cache-Control', 'no-store');
    response.send(workbook);
  }

  /**
   * Envío anónimo de una evaluación. Valida los datos demográficos, que la
   * identidad corresponda a una mujer, las respuestas y la obligatoriedad.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Enviar evaluación anónima',
    description:
      'Requiere datos demográficos y una identidad de mujer, y persiste la evaluación, respuestas y puntajes por dimensión en una sola transacción. No captura IP ni user-agent.',
  })
  @ApiCreatedResponse({ type: EvaluationCreatedResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiTooManyRequestsResponse({ description: 'Límite de solicitudes excedido' })
  async submit(
    @Body() dto: SubmitEvaluationDto,
  ): Promise<EvaluationCreatedResponseDto> {
    const entity = await this.service.submitEvaluation(dto);
    return EvaluationCreatedResponseDto.fromEntity(entity);
  }

  /**
   * Devuelve el puntaje normalizado y la clasificación por dimensión.
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
