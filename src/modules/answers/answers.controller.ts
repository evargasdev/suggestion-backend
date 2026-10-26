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

import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { AnswersService } from './answers.service';

@ApiTags('Answers')
@ApiExtraModels(PaginationResponseDto, AnswerResponseDto)
@Controller('answers')
export class AnswersController {
  constructor(private readonly service: AnswersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear opción de respuesta' })
  @ApiCreatedResponse({ type: AnswerResponseDto })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o perfil inexistente',
  })
  @ApiNotFoundResponse({ description: 'Perfil de respuestas no encontrado' })
  create(@Body() dto: CreateAnswerDto): Promise<AnswerResponseDto> {
    return this.service
      .create(dto)
      .then((entity) => AnswerResponseDto.fromEntity(entity));
  }

  @Get()
  @ApiOperation({ summary: 'Listar opciones de respuesta (paginado)' })
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
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(AnswerResponseDto) },
            },
          },
        },
      ],
    },
  })
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResponseDto<AnswerResponseDto>> {
    return this.service.findAll(pagination).then((r) => ({
      data: r.data.map((entity) => AnswerResponseDto.fromEntity(entity)),
      total: r.total,
      offset: r.offset,
      limit: r.limit,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener opción por id' })
  @ApiOkResponse({ type: AnswerResponseDto })
  @ApiNotFoundResponse({ description: 'Opción no encontrada' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AnswerResponseDto> {
    return this.service
      .findOne(id)
      .then((entity) => AnswerResponseDto.fromEntity(entity));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar opción de respuesta' })
  @ApiOkResponse({ type: AnswerResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Opción o perfil no encontrado' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAnswerDto,
  ): Promise<AnswerResponseDto> {
    return this.service
      .update(id, dto)
      .then((entity) => AnswerResponseDto.fromEntity(entity));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrado lógico de opción' })
  @ApiNoContentResponse({ description: 'Borrado lógico exitoso' })
  @ApiNotFoundResponse({ description: 'Opción no encontrada' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
