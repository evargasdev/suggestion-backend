import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from '../../../common/shared/entities';
import { EvaluationResult } from '../../results/entities/evaluation-result.entity';
import { QuestionAnswer } from '../../question-answers/entities/question-answer.entity';

@Entity('evaluations')
export class Evaluation extends Base {
  @Column({
    name: 'date',
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  //enum-pending
  @Column({ name: 'workplace', type: 'varchar', nullable: true })
  workplace: string;

  @Column({ name: 'age_range', type: 'varchar' })
  ageRange: string;

  @Column({ name: 'gender_identity', type: 'varchar' })
  genderIdentity: string;

  @Column({ name: 'vulnerable_groups', type: 'text', array: true })
  vulnerableGroups: string[];

  @Column({ name: 'origin', type: 'varchar' })
  origin: string;

  @Column({
    name: 'has_care_responsibilities',
    type: 'boolean',
    default: false,
  })
  hasCareResponsibilities: boolean;

  @Column({ name: 'care_responsibilities_details', type: 'text', array: true })
  careResponsibilitiesDetails: string[];

  @Column({ name: 'activity_type', type: 'varchar' })
  activityType: string;

  @Column({ name: 'sector', type: 'varchar' })
  sector: string;

  @Column({ name: 'position', type: 'varchar' })
  position: string;

  @OneToMany(
    () => EvaluationResult,
    (evaluationResult) => evaluationResult.evaluation,
  )
  evaluationResults: EvaluationResult[];

  @OneToMany(
    () => QuestionAnswer,
    (questionAnswer) => questionAnswer.evaluation,
  )
  questionAnswers: QuestionAnswer[];
}
