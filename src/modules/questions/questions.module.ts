import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnswerProfile } from '../answer-profiles/entities/answer-profile.entity';
import { Dimension } from '../dimensions/entities/dimension.entity';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { DimensionsService } from '../dimensions/dimensions.service';
import { AnswerProfilesService } from '../answer-profiles/answer-profiles.service';
import { AnswerProfilesModule } from '../answer-profiles/answer-profiles.module';
import { DimensionsModule } from '../dimensions/dimensions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Dimension, AnswerProfile]), AnswerProfilesModule],
  controllers: [QuestionsController],
  providers: [QuestionsService, DimensionsService, AnswerProfilesService],
  exports: [QuestionsService, TypeOrmModule],
})
export class QuestionsModule {}