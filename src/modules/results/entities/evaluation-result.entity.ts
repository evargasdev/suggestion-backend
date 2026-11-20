import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from '../../../common/shared/entities';
import { Dimension } from '../../dimensions/entities/dimension.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';

@Entity('evaluation_results')
export class EvaluationResult extends Base {
  @Column({ name: 'score', type: 'int', nullable: false })
  score: number;

  /** Null when the dimension has no applicable answers or no defined band. */
  @Column({ name: 'classification', type: 'varchar', nullable: true })
  classification: string | null;

  @ManyToOne(() => Dimension, (dimension) => dimension.evaluationResults)
  @JoinColumn({ name: 'dimension_id' })
  dimension: Dimension;

  @ManyToOne(() => Evaluation, (evaluation) => evaluation.evaluationResults)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;
}
