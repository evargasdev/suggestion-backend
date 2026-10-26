import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../../common/shared/entities';
import { Dimension } from '../../dimensions/entities/dimension.entity';
import { AnswerProfile } from '../../answer-profiles/entities/answer-profile.entity';
import { QuestionAnswer } from '../../question-answers/entities/question-answer.entity';

@Entity('questions')
export class Question extends Base {
  @Column({ name: 'label', type: 'varchar', nullable: false })
  label: string;

  @Column({ name: 'helper_text', type: 'text', nullable: false})
  helperText: string;

  @Column({ name: 'sort_order', type: 'int', nullable: false, default: 0 })
  sortOrder: number;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Dimension, (dimension) => dimension.questions)
  @JoinColumn({ name: 'dimension_id' })
  dimension: Dimension;

  @ManyToOne(() => AnswerProfile, (answerProfile) => answerProfile.questions)
  @JoinColumn({ name: 'answer_profile_id' })
  answerProfile: AnswerProfile;

  @OneToMany(() => QuestionAnswer, (questionAnswer) => questionAnswer.question)
  questionAnswers: QuestionAnswer[];
}
