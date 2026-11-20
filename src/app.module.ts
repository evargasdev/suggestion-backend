import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig } from './common/config/database';
import { generalConfig } from './common/config/general';
import { validationSchema } from './common/config/schema-validation';
import { DatasourceModule } from './common/database/database.module';
import { AnswerProfilesModule } from './modules/answer-profiles/answer-profiles.module';
import { AnswersModule } from './modules/answers/answers.module';
import { DimensionsModule } from './modules/dimensions/dimensions.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuestionAnswerModule } from './modules/question-answers/question-answers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [generalConfig, databaseConfig],
      validationSchema,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    AnswerProfilesModule,
    AnswersModule,
    DimensionsModule,
    DatasourceModule,
    EvaluationsModule,
    QuestionsModule,
    QuestionAnswerModule,
  ],
  controllers: [],
})
export class AppModule {}
