import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AnswerProfilesService } from '../answer-profiles/answer-profiles.service';
import { throwNotFound } from '../../common/throw-error';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly repository: Repository<Answer>,
    private readonly profileService: AnswerProfilesService,
  ) {}

  async create(dto: CreateAnswerDto): Promise<Answer> {
    const profile = await this.profileService.findOne(dto.answerProfileId);
    if (!profile) {
      throw new NotFoundException(
        `AnswerProfile ${dto.answerProfileId} not found`,
      );
    }
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

    try {
      const queryBuilder = this.repository
        .createQueryBuilder('answer')
        .leftJoinAndSelect('answer.answerProfile', 'profile');

      const [data, total] = await queryBuilder
        .orderBy('answer.sortOrder', 'ASC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return { data, total, offset, limit };
    } catch (error) {
      return throwNotFound('Failed to fetch paginated users');
    }
  }

  async findOne(id: string): Promise<Answer> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: { answerProfile: true },
    });
    if (!entity) {
      throw new NotFoundException(`Answer ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateAnswerDto): Promise<Answer> {
    const entity = await this.repository.preload({ id, ...dto });

    if (!entity) {
      throw new NotFoundException(
        `AnswerProfile ${dto.answerProfileId} not found`,
      );
    }

    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Answer ${id} not found`);
    }
  }
}
