import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { AnswerProfilesService } from './answer-profiles.service';
import { CreateAnswerProfileDto } from './dto/create-answer-profile.dto';
import { UpdateAnswerProfileDto } from './dto/update-answer-profile.dto';

@ApiTags('Answer Profiles')
@Controller('answer-profiles')
export class AnswerProfilesController {
  constructor(private readonly service: AnswerProfilesService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar perfil de respuestas',
    description: 'Registra un perfil de respuestas',
  })
  @ApiBody({ type: CreateAnswerProfileDto })
  create(@Body() dto: CreateAnswerProfileDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar perfiles de respuestas' })
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
  findAll(@Query() paginationDto: PaginationDto) {
    return this.service.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener perfil de respuestas por id' })
  @ApiParam({
    name: 'id',
    description: 'Identificador (UUID) del perfil de respuestas.',
    format: 'uuid',
    example: 'b2c8c0f5-1f0a-4c3e-9d6f-123456789abc',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar voto' })
  @ApiParam({
    name: 'id',
    description: 'Identificador (UUID) del perfil de respuestas.',
    format: 'uuid',
    example: 'b2c8c0f5-1f0a-4c3e-9d6f-123456789abc',
  })
  @ApiBody({ type: UpdateAnswerProfileDto })
  update(@Param('id') id: string, @Body() dto: UpdateAnswerProfileDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar perfil de respuestas' })
  @ApiParam({
    name: 'id',
    description: 'Identificador (UUID) del perfil de respuestas.',
    format: 'uuid',
    example: 'b2c8c0f5-1f0a-4c3e-9d6f-123456789abc',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
