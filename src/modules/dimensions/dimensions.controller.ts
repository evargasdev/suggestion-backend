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
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { DimensionsService } from './dimensions.service';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { DimensionResponseDto } from './dto/dimension-response.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';

@ApiTags('Dimensions')
@ApiExtraModels(PaginationResponseDto, DimensionResponseDto)
@Controller('dimensions')
export class DimensionsController {
  constructor(private readonly service: DimensionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear dimensión' })
  @ApiCreatedResponse({ type: DimensionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async create(@Body() dto: CreateDimensionDto): Promise<DimensionResponseDto> {
    const entity = await this.service.create(dto);
    return DimensionResponseDto.fromEntity(entity);
  }

  @Get()
  @ApiOperation({ summary: 'Listar dimensiones (paginado)' })
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
              items: { $ref: getSchemaPath(DimensionResponseDto) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResponseDto<DimensionResponseDto>> {
    const result = await this.service.findAll(pagination);
    return {
      ...result,
      data: result.data.map((entity) =>
        DimensionResponseDto.fromEntity(entity),
      ),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener dimensión por id' })
  @ApiOkResponse({ type: DimensionResponseDto })
  @ApiNotFoundResponse({ description: 'Dimensión no encontrada' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DimensionResponseDto> {
    const entity = await this.service.findOne(id);
    return DimensionResponseDto.fromEntity(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar dimensión' })
  @ApiOkResponse({ type: DimensionResponseDto })
  @ApiNotFoundResponse({ description: 'Dimensión no encontrada' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDimensionDto,
  ): Promise<DimensionResponseDto> {
    const entity = await this.service.update(id, dto);
    return DimensionResponseDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrado lógico de dimensión' })
  @ApiNoContentResponse({ description: 'Borrado lógico exitoso' })
  @ApiNotFoundResponse({ description: 'Dimensión no encontrada' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
