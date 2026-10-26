import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionDto } from './dto/filter-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@ApiExtraModels(PaginationResponseDto, QuestionResponseDto)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear pregunta' })
  @ApiCreatedResponse({ type: QuestionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Dimensión o perfil inexistente' })
  async create(@Body() dto: CreateQuestionDto): Promise<QuestionResponseDto> {
    const entity = await this.service.create(dto);
    return QuestionResponseDto.fromEntity(entity);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar preguntas (paginado, opcional dimensionId)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Posición inicial (>=0)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad máxima (1-100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'ILIKE sobre el texto',
  })
  @ApiQuery({
    name: 'dimensionId',
    required: false,
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(QuestionResponseDto) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Query() filter: FilterQuestionDto,
  ): Promise<PaginationResponseDto<QuestionResponseDto>> {
    const result = await this.service.findAll(filter);
    return {
      ...result,
      data: result.data.map((entity) => QuestionResponseDto.fromEntity(entity)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pregunta por id' })
  @ApiOkResponse({ type: QuestionResponseDto })
  @ApiNotFoundResponse({ description: 'Pregunta no encontrada' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<QuestionResponseDto> {
    const entity = await this.service.findOne(id);
    return QuestionResponseDto.fromEntity(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar pregunta' })
  @ApiOkResponse({ type: QuestionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({
    description: 'Pregunta, dimensión o perfil no encontrado',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const entity = await this.service.update(id, dto);
    return QuestionResponseDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrado lógico de pregunta' })
  @ApiNoContentResponse({ description: 'Borrado lógico exitoso' })
  @ApiNotFoundResponse({ description: 'Pregunta no encontrada' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
