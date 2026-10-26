import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AnswerProfilesService } from '../answer-profiles/answer-profiles.service';

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
    const { offset = 0, limit = 10, search } = pagination;
    const qb = this.repository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.answerProfile', 'profile')
      .orderBy('answer.sortOrder', 'ASC')
      .addOrderBy('answer.createdAt', 'ASC')
      .skip(offset)
      .take(limit);

    if (search && search.trim().length > 0) {
      qb.andWhere('answer.label ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, offset, limit };
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
    const entity = await this.findOne(id);
    if (dto.label !== undefined) entity.label = dto.label;
    if (dto.value !== undefined) entity.value = dto.value;
    if (dto.sortOrder !== undefined) entity.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    if (dto.answerProfileId !== undefined) {
      const profile = await this.profileService.findOne(dto.answerProfileId);
      if (!profile) {
        throw new NotFoundException(
          `AnswerProfile ${dto.answerProfileId} not found`,
        );
      }
      entity.answerProfile = profile;
    }
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.softDelete({ id });
    if (!result.affected) {
      throw new NotFoundException(`Answer ${id} not found`);
    }
  }
}
