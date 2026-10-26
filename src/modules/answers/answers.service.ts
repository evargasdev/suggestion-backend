import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { AnswerProfilesService } from '../answer-profiles/answer-profiles.service';
import { throwNotFound } from '../../common/throw-error';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly repository: Repository<Answer>,
    private readonly profileService: AnswerProfilesService,
  ) {}

  async create(dto: CreateAnswerDto): Promise<Answer> {
    const profile = await this.profileService.findOne(dto.answerProfileId);
    const created = this.repository.create({
      label: dto.label,
      value: dto.value,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      answerProfile: profile,
    });
    return this.repository.save(created);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginationResponseDto<Answer>> {
    const { offset = 0, limit = 10 } = pagination;

    const queryBuilder = this.repository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.answerProfile', 'profile');

    const [data, total] = await queryBuilder
      .orderBy('answer.sortOrder', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total, offset, limit };
  }

  async findOne(id: string): Promise<Answer> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: { answerProfile: true },
    });
    if (!entity) {
      return throwNotFound(`Answer ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateAnswerDto): Promise<Answer> {
    const { answerProfileId, ...updates } = dto;
    const entity = await this.repository.preload({
      id,
      ...updates,
    });

    if (!entity) {
      return throwNotFound(`Answer ${id} not found`);
    }

    if (answerProfileId) {
      entity.answerProfile = await this.profileService.findOne(answerProfileId);
    }

    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) {
      throwNotFound(`Answer ${id} not found`);
    }
  }
}
