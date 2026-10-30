import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { QuestionAnswerService } from "./question-answers.service";
import { ApiBody, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CreateQuestionAnswerDto } from "./dto/create-question-answer.dto";
import { PaginationDto } from "../../common/shared/dtos/pagination.dto";

@Controller('question-answers')
export class QuestionAnswerController {
    constructor(private readonly service: QuestionAnswerService) {}

    @Post()
    @ApiOperation({
        summary: 'Registrar la respuesta a una pregunta',
        description: 'Registra la respuesta a una pregunta'
    })
    @ApiBody({ type: CreateQuestionAnswerDto })
    create(@Body() dto: CreateQuestionAnswerDto) {
        return this.service.create(dto)
    }

    @Get()
      @ApiOperation({ summary: 'Listar respuestas a preguntas' })
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
}