import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './common/config/database';
import { generalConfig } from './common/config/general';
import { validationSchema } from './common/config/schema-validation';
import { DatasourceModule } from './common/database/database.module';
import { AnswerProfilesModule } from './modules/answer-profiles/answer-profiles.module';
import { AnswersModule } from './modules/answers/answers.module';
import { DimensionsModule } from './modules/dimensions/dimensions.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuestionAnswer } from './modules/question-answers/entities/question-answer.entity';
import { QuestionAnswerModule } from './modules/question-answers/question-answers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [generalConfig, databaseConfig],
      validationSchema,
    }),
    // Módulos funcionales (orden alfabético)
    AnswerProfilesModule,
    AnswersModule,
    DimensionsModule,
    DatasourceModule,
    EvaluationsModule,
    QuestionsModule,
    QuestionAnswerModule
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: JwtAuthGuard,
  //   },
  // ],
})
export class AppModule {}
