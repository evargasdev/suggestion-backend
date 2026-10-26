import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from '../../common/shared/dtos/pagination.dto';
import { PaginationResponseDto } from '../../common/shared/dtos/pagination-response.dto';
import { Dimension } from './entities/dimension.entity';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';
import { throwNotFound } from '../../common/throw-error';

@Injectable()
export class DimensionsService {
  constructor(
    @InjectRepository(Dimension)
    private readonly repository: Repository<Dimension>,
  ) {}

  async create(dto: CreateDimensionDto): Promise<Dimension> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginationResponseDto<Dimension>> {
    const { offset = 0, limit = 10, search } = pagination;
    const query = this.repository
      .createQueryBuilder('dimension')
      .orderBy('dimension.sortOrder', 'ASC')
      .addOrderBy('dimension.createdAt', 'ASC')
      .skip(offset)
      .take(limit);

    if (search?.trim()) {
      query.andWhere('dimension.label ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, offset, limit };
  }

  async findOne(id: string): Promise<Dimension> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return throwNotFound(`Dimension ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateDimensionDto): Promise<Dimension> {
    const entity = await this.repository.preload({ id, ...dto });

    if (!entity) {
      return throwNotFound(`Dimension ${id} not found`);
    }

    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.softDelete({ id });
    if (!result.affected) {
      return throwNotFound(`Dimension ${id} not found`);
    }
  }
}
