import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionAnswer } from './entities/question-answer.entity';
import { QuestionAnswerController } from './question-answers.controller';
import { QuestionAnswerService } from './question-answers.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionAnswer])],
  controllers: [QuestionAnswerController],
  providers: [QuestionAnswerService],
  exports: [QuestionAnswerService, TypeOrmModule],
})
export class QuestionAnswerModule {}
