import { MigrationInterface, QueryRunner } from 'typeorm';

type SeedQuestion = {
  label: string;
  helperText: string;
  profile: 'direct' | 'inverted';
};

type SeedDimension = {
  label: string;
  questions: SeedQuestion[];
};

const dimensions: SeedDimension[] = [
  {
    label: 'Laboral',
    questions: [
      {
        label: 'En tu centro de trabajo el salario que percibes es suficiente.',
        helperText:
          'Tu salario es superior al mínimo y te alcanza para cubrir tus necesidades.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo las propinas se distribuyen de manera equitativa.',
        helperText:
          'Ya sea que te correspondan o no propinas, consideras que se distribuyen correctamente.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo las condiciones laborales están dentro de la ley.',
        helperText:
          'Tu jornada laboral es de 8 horas, tienes vacaciones pagadas, recibes aguinaldo, primas y reparto de utilidades.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo se respeta el horario de entrada y salida, y de comida.',
        helperText:
          'Tienes tiempo suficiente para comer, se establece y se cumple el horario de entrada y de salida.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo cuentas con prestaciones de seguridad social.',
        helperText:
          'Como servicio médico del IMSS, ahorro para el retiro, crédito para la vivienda, guardería (en su caso).',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo cuentas con otras prestaciones y servicios.',
        helperText:
          'Como permisos con o sin goce de sueldo, caja de ahorro, préstamos sobre el sueldo, bonos, premios, seguro de vida, seguro de gastos médicos, transporte, servicio médico interno, alimentos.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo cuentas con el espacio, uniformes, instrumentos y materiales adecuados y suficientes para realizar tu función.',
        helperText:
          'Te proporcionan uniformes, equipos y herramientas necesarias, como equipo de seguridad, de cómputo, materiales de oficina, de limpieza, entre otros. Cuentas con un espacio adecuado para realizar tus funciones y consumir tus alimentos.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo se consideran tus necesidades familiares y personales al establecer o modificar tus horarios laborales.',
        helperText:
          'Se toman en cuenta tus responsabilidades familiares, necesidades personales y entre otras para asignar tu horario.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo se reduce tu jornada laboral y salario durante la temporada baja.',
        helperText:
          'Disminución de días y horas laborales durante periodos de baja ocupación turística, como el “descanso solidario” que puede implicar una reducción de tu ingreso.',
        profile: 'direct',
      },
    ],
  },
  {
    label: 'Discriminación',
    questions: [
      {
        label:
          'En tu centro de trabajo recibes un trato diferente al de tus compañeros hombres, por el hecho de ser mujer.',
        helperText:
          'Les dan preferencia a los varones y a ti te obstaculizan o impiden un mejor puesto o salario. Te tratan con respeto.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo te discriminan por tu apariencia física, edad, identidad de género u orientación sexual.',
        helperText:
          'Te tratan de manera diferente o te excluyen por tu peso, color de piel, edad o identidad de género.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo te discriminan por tu origen étnico, por ser migrante, por tu religión, por tu condición social o económica, discapacidad.',
        helperText:
          'Te tratan de manera diferente o te excluyen por tu lugar de origen, por tus creencias, situación económica o discapacidad (en su caso).',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo te discriminan por ser madre o por embarazo.',
        helperText:
          'Te tratan de manera diferente o te excluyen por ser madre, por estar embarazada o te pidieron un certificado de ingravidez.',
        profile: 'inverted',
      },
      {
        label: 'En tu centro de trabajo se garantiza la igualdad salarial.',
        helperText:
          'Recibes la misma remuneración que el resto de tus compañeros y compañeras que tienen las mismas responsabilidades que tú.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo las condiciones laborales son justas y equitativas.',
        helperText:
          'Tienes las mismas oportunidades que tus compañeros y compañeras a ocupar puestos.',
        profile: 'direct',
      },
      {
        label:
          'En tu centro de trabajo se previenen, atienden y sancionan prácticas de discriminación.',
        helperText:
          'Existen políticas, comités o capacitación para prevenir y atender situaciones de discriminación.',
        profile: 'direct',
      },
    ],
  },
  {
    label: 'Violencias',
    questions: [
      {
        label:
          'En tu centro de trabajo te han intimidado, humillado, aislado o desgastado emocionalmente.',
        helperText:
          'Se refiere a descalificar tu trabajo, como amenazas, humillaciones, explotación e incumplimiento de las condiciones generales de trabajo. Es un tipo de violencia psicológica. Acoso laboral, bossing, mobbing.',
        profile: 'inverted',
      },
      {
        label: 'En tu centro de trabajo te han agredido físicamente.',
        helperText:
          'Violencia física: es cualquier acto que inflige daño no accidental, usando la fuerza física o algún tipo de arma, objeto, ácido o sustancia corrosiva, cáustica, irritante, tóxica o inflamable o cualquier otra sustancia que, en determinadas condiciones, pueda provocar o no lesiones ya sean internas, externas, o ambas.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo te han retenido sin tu consentimiento objetos o documentos personales.',
        helperText:
          'Violencia patrimonial: es cualquier acto u omisión que afecta la supervivencia de la víctima. Se manifiesta en: la transformación, sustracción, destrucción, retención o distracción de objetos, documentos personales, bienes y valores, derechos patrimoniales o recursos económicos destinados a satisfacer sus necesidades y puede abarcar los daños a los bienes comunes o propios de la víctima.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo te han impedido acceder a un mejor puesto o te han condicionado algún pago o beneficio.',
        helperText:
          'Violencia económica: es toda acción u omisión del agresor que afecta la supervivencia económica de la víctima. Se manifiesta a través de limitaciones encaminadas a controlar el ingreso de sus percepciones económicas, así como la percepción de un salario menor por igual trabajo, dentro de un mismo centro laboral.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo tus superiores te han hostigado sexualmente.',
        helperText:
          'Hostigamiento sexual: conductas verbales, físicas o ambas, con connotaciones sexuales, de un superior jerárquico.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo los huéspedes o clientes te han hostigado sexualmente.',
        helperText:
          'Hostigamiento sexual: conductas verbales, físicas o ambas, con connotaciones sexuales, de un superior jerárquico.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo tus compañeros o proveedores te han acosado sexualmente.',
        helperText:
          'Acoso sexual: conductas verbales, físicas o ambas, con connotaciones sexuales, de un compañero.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo te han obligado a tener relaciones sexuales.',
        helperText:
          'Violación: por medio de violencia física o moral realiza cópula con persona de cualquier sexo. Se entiende por cópula, la introducción del miembro viril o cualquier otro instrumento en el cuerpo de la víctima por vía vaginal, anal u oral.',
        profile: 'inverted',
      },
      {
        label:
          'En tu centro de trabajo han distribuido imágenes tuyas reales o simulando contenido íntimo sexual, sin tu consentimiento.',
        helperText:
          'Violencia digital: exponer, distribuir, difundir, exhibir, transmitir, comercializar, ofertar, intercambiar o compartir imágenes, audios o videos reales o simulados de contenido íntimo sexual sin tu consentimiento.',
        profile: 'inverted',
      },
    ],
  },
  {
    label: 'Cuidados y corresponsabilidad',
    questions: [
      {
        label:
          'Tus horarios o jornadas laborales dificultan atender tus responsabilidades familiares o de cuidado.',
        helperText:
          'Incompatibilidad entre las exigencias laborales y la atención de hijas, hijos, personas mayores, enfermas o con discapacidad.',
        profile: 'inverted',
      },
      {
        label:
          'En tu trabajo te han limitado las oportunidades de capacitación, crecimiento o ascenso por tener responsabilidades familiares o de cuidado.',
        helperText:
          'Prácticas laborales que restringen el desarrollo profesional de las trabajadoras debido a la maternidad o a sus responsabilidades de cuidado, reproduciendo desigualdades de género.',
        profile: 'inverted',
      },
      {
        label:
          'Has recibido comentarios negativos o cuestionamientos sobre tu compromiso laboral debido a tus responsabilidades familiares o de cuidado.',
        helperText:
          'Críticas, descalificaciones o estereotipos asociados con la maternidad y otras responsabilidades de cuidado.',
        profile: 'inverted',
      },
      {
        label:
          'La combinación de tu empleo y tus responsabilidades de cuidado te generan sobrecarga física o emocional.',
        helperText:
          'Acumulación de actividades laborales, domésticas y de cuidado que produce cansancio, tensión o desgaste emocional.',
        profile: 'inverted',
      },
      {
        label:
          'Las exigencias de tu empleo limitan el tiempo que puedes dedicar a tu descanso, autocuidado o actividades personales.',
        helperText:
          'Reducción del tiempo disponible para descansar, atender necesidades propias y realizar actividades recreativas debido a las exigencias laborales.',
        profile: 'inverted',
      },
      {
        label:
          'Has recibido un trato laboral desfavorable debido a tus responsabilidades familiares o de cuidado.',
        helperText:
          'Diferencias injustificadas en permisos, asignación de tareas, turnos u oportunidades laborales relacionadas con las responsabilidades de cuidado.',
        profile: 'inverted',
      },
    ],
  },
  {
    label: 'Salud física y mental',
    questions: [
      {
        label:
          'Las situaciones que enfrentas en su centro de trabajo te generan agotamiento emocional.',
        helperText:
          'Desgaste emocional, falta de energía o sensación de saturación relacionada con las experiencias laborales.',
        profile: 'inverted',
      },
      {
        label:
          'Las situaciones que enfrentas en tu centro de trabajo te generan estrés, preocupación o tensión incluso después de terminar tu jornada.',
        helperText:
          'Preocupaciones laborales que persisten fuera del horario de trabajo y afectan tu tranquilidad.',
        profile: 'inverted',
      },
      {
        label:
          'El trato que recibes en tu trabajo afecta tu estado de ánimo o autoestima.',
        helperText:
          'Sentimientos de tristeza, inseguridad, desvalorización o pérdida de confianza relacionados con situaciones de trato desfavorable en el entorno laboral.',
        profile: 'inverted',
      },
      {
        label:
          'Las condiciones y exigencias de tu empleo te generan agotamiento físico.',
        helperText:
          'Cansancio físico persistente relacionado con jornadas prolongadas, cargas de trabajo excesivas o actividades físicamente demandantes.',
        profile: 'inverted',
      },
      {
        label:
          'Has presentado molestias físicas que se relacionan con tus actividades laborales.',
        helperText:
          'Dolores musculares, de cabeza, espalda, articulaciones, quemaduras u otras molestias relacionadas.',
        profile: 'inverted',
      },
      {
        label:
          'Los horarios y las jornadas laborales han afectado tu descanso y calidad del sueño.',
        helperText:
          'Dificultades para dormir, sueño insuficiente o alteraciones de los horarios de descanso relacionadas con turnos rotativos, jornadas prolongadas o periodos insuficientes de recuperación.',
        profile: 'inverted',
      },
    ],
  },
];

export class AddTourismWomenSurvey1794015000000 implements MigrationInterface {
  name = 'AddTourismWomenSurvey1794015000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const questionCount = dimensions.reduce(
      (count, dimension) => count + dimension.questions.length,
      0,
    );
    if (questionCount !== 37) {
      throw new Error(`Expected 37 survey questions, found ${questionCount}`);
    }

    await queryRunner.query(`
      ALTER TABLE "evaluations"
        ADD COLUMN IF NOT EXISTS "age_range" character varying,
        ADD COLUMN IF NOT EXISTS "gender_identity" character varying,
        ADD COLUMN IF NOT EXISTS "vulnerable_groups" text[],
        ADD COLUMN IF NOT EXISTS "origin" character varying,
        ADD COLUMN IF NOT EXISTS "has_care_responsibilities" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "care_responsibilities_details" text[],
        ADD COLUMN IF NOT EXISTS "activity_type" character varying,
        ADD COLUMN IF NOT EXISTS "sector" character varying,
        ADD COLUMN IF NOT EXISTS "position" character varying
    `);
    await queryRunner.query(`
      UPDATE "evaluations"
      SET
        "age_range" = COALESCE("age_range", 'No especificado'),
        "gender_identity" = COALESCE("gender_identity", 'No especificado'),
        "vulnerable_groups" = COALESCE("vulnerable_groups", '{}'::text[]),
        "origin" = COALESCE("origin", 'No especificado'),
        "has_care_responsibilities" = COALESCE(
          "has_care_responsibilities",
          false
        ),
        "care_responsibilities_details" = COALESCE(
          "care_responsibilities_details",
          '{}'::text[]
        ),
        "activity_type" = COALESCE("activity_type", 'No especificado'),
        "sector" = COALESCE("sector", 'No especificado'),
        "position" = COALESCE("position", 'No especificado')
      WHERE
        "age_range" IS NULL OR "gender_identity" IS NULL OR
        "vulnerable_groups" IS NULL OR "origin" IS NULL OR
        "has_care_responsibilities" IS NULL OR
        "care_responsibilities_details" IS NULL OR
        "activity_type" IS NULL OR "sector" IS NULL OR "position" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "evaluations"
        ALTER COLUMN "age_range" SET DEFAULT 'No especificado',
        ALTER COLUMN "age_range" SET NOT NULL,
        ALTER COLUMN "gender_identity" SET DEFAULT 'No especificado',
        ALTER COLUMN "gender_identity" SET NOT NULL,
        ALTER COLUMN "vulnerable_groups" SET DEFAULT '{}'::text[],
        ALTER COLUMN "vulnerable_groups" SET NOT NULL,
        ALTER COLUMN "origin" SET DEFAULT 'No especificado',
        ALTER COLUMN "origin" SET NOT NULL,
        ALTER COLUMN "has_care_responsibilities" SET DEFAULT false,
        ALTER COLUMN "has_care_responsibilities" SET NOT NULL,
        ALTER COLUMN "care_responsibilities_details" SET DEFAULT '{}'::text[],
        ALTER COLUMN "care_responsibilities_details" SET NOT NULL,
        ALTER COLUMN "activity_type" SET DEFAULT 'No especificado',
        ALTER COLUMN "activity_type" SET NOT NULL,
        ALTER COLUMN "sector" SET DEFAULT 'No especificado',
        ALTER COLUMN "sector" SET NOT NULL,
        ALTER COLUMN "position" SET DEFAULT 'No especificado',
        ALTER COLUMN "position" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "answers"
        ADD COLUMN IF NOT EXISTS "is_not_applicable" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      CREATE OR REPLACE VIEW "vw_dashboard_stats" AS
      SELECT
        e."sector",
        e."position",
        er."dimension_id",
        d."label" AS "dimension_label",
        AVG(er."score") AS "promedio_puntaje",
        COUNT(DISTINCT e."id") AS "total_evaluaciones"
      FROM "evaluations" e
      JOIN "evaluation_results" er ON er."evaluation_id" = e."id"
      JOIN "dimensions" d ON d."id" = er."dimension_id"
      GROUP BY e."sector", e."position", er."dimension_id", d."label"
    `);

    const profileIds = new Map<string, string>();
    for (const label of [
      'Perfil Directo (0 a 3)',
      'Perfil Invertido (3 a 0)',
    ]) {
      await queryRunner.query(
        `INSERT INTO "answer_profiles" ("label")
         SELECT $1::character varying
         WHERE NOT EXISTS (SELECT 1 FROM "answer_profiles" WHERE "label" = $1)`,
        [label],
      );
      const rows: Array<{ id: string }> = await queryRunner.query(
        `SELECT "id" FROM "answer_profiles" WHERE "label" = $1 ORDER BY "create_at" ASC LIMIT 1`,
        [label],
      );
      if (!rows[0]?.id) {
        throw new Error(`Could not create answer profile "${label}"`);
      }
      profileIds.set(label, rows[0].id);
      await queryRunner.query(
        `UPDATE "answer_profiles" SET "delete_at" = NULL WHERE "id" = $1`,
        [rows[0].id],
      );
    }

    const directId = profileIds.get('Perfil Directo (0 a 3)');
    const invertedId = profileIds.get('Perfil Invertido (3 a 0)');
    if (!directId || !invertedId) {
      throw new Error('Could not create the survey answer profiles');
    }

    const seedAnswers = [
      { profileId: directId, label: 'Nunca', value: 0, order: 0 },
      { profileId: directId, label: 'Algunas veces', value: 1, order: 1 },
      { profileId: directId, label: 'Con frecuencia', value: 2, order: 2 },
      { profileId: directId, label: 'Siempre', value: 3, order: 3 },
      { profileId: invertedId, label: 'Nunca', value: 3, order: 0 },
      { profileId: invertedId, label: 'Algunas veces', value: 2, order: 1 },
      { profileId: invertedId, label: 'Con frecuencia', value: 1, order: 2 },
      { profileId: invertedId, label: 'Siempre', value: 0, order: 3 },
      {
        profileId: invertedId,
        label: 'No aplica',
        value: 0,
        order: 4,
        isNotApplicable: true,
      },
    ];

    for (const answer of seedAnswers) {
      await queryRunner.query(
        `INSERT INTO "answers"
          ("label", "value", "sort_order", "is_active", "is_not_applicable", "answer_profile_id")
         SELECT $1::character varying, $2::integer, $3::integer, true,
                $4::boolean, $5::uuid
         WHERE NOT EXISTS (
           SELECT 1 FROM "answers"
           WHERE "answer_profile_id" = $5 AND "label" = $1
         )`,
        [
          answer.label,
          answer.value,
          answer.order,
          answer.isNotApplicable ?? false,
          answer.profileId,
        ],
      );
      await queryRunner.query(
        `UPDATE "answers"
         SET "value" = $2, "sort_order" = $3, "is_active" = true,
             "is_not_applicable" = $4, "delete_at" = NULL
         WHERE "answer_profile_id" = $5 AND "label" = $1`,
        [
          answer.label,
          answer.value,
          answer.order,
          answer.isNotApplicable ?? false,
          answer.profileId,
        ],
      );
    }

    for (const [index, dimension] of dimensions.entries()) {
      await queryRunner.query(
        `INSERT INTO "dimensions" ("label", "sort_order", "is_active")
         SELECT $1::character varying, $2::integer, true
         WHERE NOT EXISTS (SELECT 1 FROM "dimensions" WHERE "label" = $1)`,
        [dimension.label, index + 1],
      );
      const dimensionRows: Array<{ id: string }> = await queryRunner.query(
        `SELECT "id" FROM "dimensions" WHERE "label" = $1 ORDER BY "create_at" ASC LIMIT 1`,
        [dimension.label],
      );
      const dimensionId = dimensionRows[0]?.id;
      if (!dimensionId) {
        throw new Error(`Could not create dimension "${dimension.label}"`);
      }
      await queryRunner.query(
        `UPDATE "dimensions"
         SET "sort_order" = $2, "is_active" = true, "delete_at" = NULL
         WHERE "id" = $1`,
        [dimensionId, index + 1],
      );

      for (const [questionIndex, question] of dimension.questions.entries()) {
        const answerProfileId =
          question.profile === 'direct' ? directId : invertedId;
        await queryRunner.query(
          `INSERT INTO "questions"
            ("label", "helper_text", "sort_order", "is_required", "is_active", "dimension_id", "answer_profile_id")
           SELECT $1::character varying, $2::text, $3::integer, true, true,
                  $4::uuid, $5::uuid
           WHERE NOT EXISTS (
             SELECT 1 FROM "questions"
             WHERE "dimension_id" = $4 AND "label" = $1
           )`,
          [
            question.label,
            question.helperText,
            questionIndex + 1,
            dimensionId,
            answerProfileId,
          ],
        );
        await queryRunner.query(
          `UPDATE "questions"
           SET "helper_text" = $2, "sort_order" = $3, "is_required" = true,
               "is_active" = true, "answer_profile_id" = $4, "delete_at" = NULL
           WHERE "dimension_id" = $5 AND "label" = $1`,
          [
            question.label,
            question.helperText,
            questionIndex + 1,
            answerProfileId,
            dimensionId,
          ],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS "vw_dashboard_stats"`);
    // Keep columns and catalog rows: an earlier generated migration may
    // already have added the columns, and submissions may reference the catalog.
  }
}
