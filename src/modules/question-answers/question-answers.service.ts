import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionAnswer } from './entities/question-answer.entity';
import { CreateQuestionAnswerDto } from './dto/create-question-answer.dto';
import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { throwNotFound } from '../../common/throw-error';

@Injectable()
export class QuestionAnswerService {
  constructor(
    @InjectRepository(QuestionAnswer)
    private readonly repository: Repository<QuestionAnswer>,
  ) {}

  async create(dto: CreateQuestionAnswerDto): Promise<QuestionAnswer> {
    const entity = this.repository.create({
      evaluation: { id: dto.evaluationId },
      question: { id: dto.questionId },
      answer: { id: dto.answerId },
    });
    return this.repository.save(entity);
  }

  async findAll(
    dto: PaginationDto,
  ): Promise<PaginationResponseDto<QuestionAnswer>> {
    const { offset = 0, limit = 10, search } = dto;

    try {
      const query = this.repository
        .createQueryBuilder('question_answer')
        .leftJoinAndSelect('question_answer.evaluations', 'evaluation')
        .leftJoinAndSelect('question_answer.questions', 'question')
        .leftJoinAndSelect('question_answer.answers', 'answer')
        .select([
          'question_answer.id',
          'question_answer.createdAt',
          'evaluation.id',
          'question.id',
          'question.label',
          'answer.id',
          'answer.label',
          'answer.value',
        ]);

      const [data, total] = await query
        .orderBy('user.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return { data, total, offset, limit };
    } catch (error) {
      return throwNotFound(`Question Answers not found`);
    }
  }
}
