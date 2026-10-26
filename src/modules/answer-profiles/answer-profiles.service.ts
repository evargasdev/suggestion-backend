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
    const answerProfile = await this.repository.findOne({ where: { id } });
    if (!answerProfile) {
      return throwNotFound(`AnswerProfile ${id} not found`);
    }
    return answerProfile;
  }

  async update(
    id: string,
    dto: UpdateAnswerProfileDto,
  ): Promise<AnswerProfile> {
    const answerProfile = await this.repository.preload({
      id,
      ...dto,
    });

    if (!answerProfile) {
      return throwNotFound(`AnswerProfile ${id} not found`);
    }

    return this.repository.save(answerProfile);
  }

  async remove(id: string): Promise<void> {
    const answerProfile = await this.findOne(id);
    await this.repository.softDelete(answerProfile.id);
  }
}
