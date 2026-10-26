import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from '../../../common/shared/entities';
import { AnswerProfile } from '../../answer-profiles/entities/answer-profile.entity';
import { QuestionAnswer } from '../../question-answers/entities/question-answer.entity';

@Entity('answers')
export class Answer extends Base {
  @Column({ name: 'label', type: 'varchar', nullable: false })
  label: string;

  @Column({ name: 'value', type: 'int', nullable: false })
  value: number;

  @Column({ name: 'sort_order', type: 'int', nullable: false, default: 0 })
  sortOrder: number;
  
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => AnswerProfile, (answerProfile) => answerProfile.answers)
  @JoinColumn({ name: 'answer_profile_id' })
  answerProfile: AnswerProfile;

  @OneToMany(() => QuestionAnswer, (questionAnswer) => questionAnswer.answer)
  questionAnswers: QuestionAnswer[];
}
