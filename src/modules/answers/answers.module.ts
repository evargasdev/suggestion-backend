import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Answer } from './entities/answer.entity';
import { AnswerProfile } from '../answer-profiles/entities/answer-profile.entity';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { AnswerProfilesService } from '../answer-profiles/answer-profiles.service';
import { AnswerProfilesModule } from '../answer-profiles/answer-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer, AnswerProfile]),
    AnswerProfilesModule,
  ],
  controllers: [AnswersController],
  providers: [AnswersService, AnswerProfilesService],
  exports: [AnswersService, TypeOrmModule],
})
export class AnswersModule {}
