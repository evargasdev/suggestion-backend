import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { throwNotFound } from '../../common/throw-error';
import { AnswerProfilesService } from '../answer-profiles/answer-profiles.service';
import { DimensionsService } from '../dimensions/dimensions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FilterQuestionDto } from './dto/filter-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly repository: Repository<Question>,
    private readonly dimensionService: DimensionsService,
    private readonly profileService: AnswerProfilesService,
  ) {}

  async create(dto: CreateQuestionDto): Promise<Question> {
    const dimension = await this.dimensionService.findOne(dto.dimensionId);
    const answerProfile = await this.profileService.findOne(
      dto.answerProfileId,
    );
    const created = this.repository.create({
      label: dto.label,
      helperText: dto.helperText,
      sortOrder: dto.sortOrder ?? 0,
      isRequired: dto.isRequired ?? true,
      isActive: dto.isActive ?? true,
      dimension,
      answerProfile,
    });
    return this.repository.save(created);
  }

  async findAll(
    filter: FilterQuestionDto,
  ): Promise<PaginationResponseDto<Question>> {
    const { offset = 0, limit = 10, search, dimensionId } = filter;
    const qb = this.repository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.dimension', 'dimension')
      .leftJoinAndSelect('question.answerProfile', 'answerProfile')
      .orderBy('question.sortOrder', 'ASC')
      .addOrderBy('question.createdAt', 'ASC')
      .skip(offset)
      .take(limit);

    if (dimensionId) {
      qb.andWhere('dimension.id = :dimensionId', { dimensionId });
    }
    if (search && search.trim().length > 0) {
      qb.andWhere('question.label ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, offset, limit };
  }

  async findOne(id: string): Promise<Question> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: { dimension: true, answerProfile: true },
    });
    if (!entity) {
      return throwNotFound(`Question ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<Question> {
    const { dimensionId, answerProfileId, ...updates } = dto;
    const question = await this.repository.preload({
      id,
      ...updates,
    });

    if (!question) {
      return throwNotFound(`Question ${id} not found`);
    }

    if (dimensionId) {
      question.dimension = await this.dimensionService.findOne(dimensionId);
    }
    if (answerProfileId) {
      question.answerProfile =
        await this.profileService.findOne(answerProfileId);
    }

    return this.repository.save(question);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.softDelete({ id });
    if (!result.affected) {
      throwNotFound(`Question ${id} not found`);
    }
  }
}
