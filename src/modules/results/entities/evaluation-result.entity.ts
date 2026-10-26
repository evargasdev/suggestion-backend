import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from '../../../common/shared/entities';
import { Dimension } from '../../dimensions/entities/dimension.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';

@Entity('evaluation_results')
export class EvaluationResult extends Base {
  @Column({ name: 'score', type: 'int', nullable: false })
  score: number;

  /**
   * La clasificación (bajo/medio/alto, etc.) NO está definida todavía.
   *
   * Originalmente era NOT NULL con un placeholder `//enum-pending`. Para
   * reflejar el estado real del dominio se marca como `nullable: true`.
   * Los servicios nunca inventan una clasificación: cuando no existe
   * una regla, este campo se persiste como `null`.
   *
   * MIGRACIÓN OBLIGATORIA (no usar `synchronize:true` en producción):
   *
   *   ALTER TABLE evaluation_results
   *     ALTER COLUMN classification DROP NOT NULL;
   *
   * Ver `migrations/README.md` para más detalles.
   */
  //enum-pending
  @Column({ name: 'classification', type: 'varchar', nullable: true })
  classification: string | null;

  @ManyToOne(() => Dimension, (dimension) => dimension.evaluationResults)
  @JoinColumn({ name: 'dimension_id' })
  dimension: Dimension;

  @ManyToOne(() => Evaluation, (evaluation) => evaluation.evaluationResults)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;
}
