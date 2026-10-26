import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Dimension } from './entities/dimension.entity';
import { DimensionsController } from './dimensions.controller';
import { DimensionsService } from './dimensions.service';
import { QuestionsService } from '../questions/questions.service';
import { QuestionsModule } from '../questions/questions.module';
import { AnswerProfilesModule } from '../answer-profiles/answer-profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dimension]), QuestionsModule, AnswerProfilesModule],
  controllers: [DimensionsController],
  providers: [DimensionsService ,QuestionsService],
  exports: [DimensionsService, TypeOrmModule],
})
export class DimensionsModule {}
