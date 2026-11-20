import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { throwNotFound } from '../../common/throw-error';
import { CreateAnswerProfileDto } from './dto/create-answer-profile.dto';
import { UpdateAnswerProfileDto } from './dto/update-answer-profile.dto';
import { AnswerProfile } from './entities/answer-profile.entity';

@Injectable()
export class AnswerProfilesService {
  constructor(
    @InjectRepository(AnswerProfile)
    private readonly repository: Repository<AnswerProfile>,
  ) {}

  create(dto: CreateAnswerProfileDto): Promise<AnswerProfile> {
    return this.repository.save(this.repository.create(dto));
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginationResponseDto<AnswerProfile>> {
    const { offset = 0, limit = 10 } = pagination;

    const [data, total] = await this.repository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      offset,
      limit,
    };
  }

  async findOne(id: string): Promise<AnswerProfile> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return throwNotFound(`AnswerProfile ${id} not found`);
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateAnswerProfileDto,
  ): Promise<AnswerProfile> {
    const entity = await this.repository.preload({
      id,
      ...dto,
    });

    if (!entity) {
      return throwNotFound(`AnswerProfile ${id} not found`);
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
