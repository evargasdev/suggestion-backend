import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnswerProfile } from './entities/answer-profile.entity';
import { AnswerProfilesController } from './answer-profiles.controller';
import { AnswerProfilesService } from './answer-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnswerProfile])],
  controllers: [AnswerProfilesController],
  providers: [AnswerProfilesService],
  exports: [TypeOrmModule, AnswerProfilesService],
})
export class AnswerProfilesModule {}