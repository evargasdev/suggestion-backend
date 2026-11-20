import { Module } from '@nestjs/common';

import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { DimensionsService } from '../dimensions/dimensions.service';
import { Evaluation } from './entities/evaluation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dimension } from '../dimensions/entities/dimension.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluation, Dimension])],
  controllers: [EvaluationsController],
  providers: [EvaluationsService, DimensionsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}