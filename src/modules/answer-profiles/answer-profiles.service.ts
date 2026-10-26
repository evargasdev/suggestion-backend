import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
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
    return this.repository.save(this.repository.create({ label: dto.label }));
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginationResponseDto<AnswerProfile>> {
    const { offset = 0, limit = 10 } = pagination;

    const where: FindOptionsWhere<AnswerProfile> = {};

    const [data, total] = await this.repository.findAndCount({
      where,
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
      throw new NotFoundException(`AnswerProfile ${id} not found`);
    }
    return answerProfile;
  }

  async update(
    id: string,
    updateAnswerProfileDto: UpdateAnswerProfileDto,
  ): Promise<AnswerProfile> {
    const vote = await this.repository.preload({
      id,
      ...updateAnswerProfileDto,
    });

    if (!vote) {
      throw new NotFoundException(`Vote with id ${id} not found`);
    }

    return await this.repository.save(vote);
  }

  async remove(id: string): Promise<void> {
    const answerProfile = await this.findOne(id);
    await this.repository.softDelete(answerProfile);
  }
}
