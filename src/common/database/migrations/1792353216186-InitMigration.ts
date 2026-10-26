import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1792353216186 implements MigrationInterface {
    name = 'InitMigration1792353216186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "evaluation_id" uuid, "question_id" uuid, "answer_id" uuid, CONSTRAINT "PK_5257525a7773e5159714a3eb13c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workplace" character varying, CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evaluation_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "score" integer NOT NULL, "classification" character varying, "dimension_id" uuid, "evaluation_id" uuid, CONSTRAINT "PK_c621da2265b8bed07a44a5d5fa6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dimensions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "label" character varying NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_79693265d800ad0830d1ddddb41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "label" character varying NOT NULL, "helper_text" text NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "is_required" boolean NOT NULL DEFAULT true, "is_active" boolean NOT NULL DEFAULT true, "dimension_id" uuid, "answer_profile_id" uuid, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "label" character varying NOT NULL, CONSTRAINT "PK_1135ec350b9315f55d2f3b0ad10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delete_at" TIMESTAMP WITH TIME ZONE, "label" character varying NOT NULL, "value" integer NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "answer_profile_id" uuid, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_answers" ADD CONSTRAINT "FK_c55d674afab6d6305568007512e" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_answers" ADD CONSTRAINT "FK_941b909bd831f96c46d389ccde4" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_answers" ADD CONSTRAINT "FK_2e73c38a52d2633171fab07acfd" FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_results" ADD CONSTRAINT "FK_bfe5b207264889299a20563c753" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_results" ADD CONSTRAINT "FK_4430e307a2b26baefc825c1dfa4" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_4afde5a1e0347a83e875fd1175c" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_b54fafce891a0691c9013b4af1d" FOREIGN KEY ("answer_profile_id") REFERENCES "answer_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_ebf1feb06f1f367ad46cef8739a" FOREIGN KEY ("answer_profile_id") REFERENCES "answer_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_ebf1feb06f1f367ad46cef8739a"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_b54fafce891a0691c9013b4af1d"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_4afde5a1e0347a83e875fd1175c"`);
        await queryRunner.query(`ALTER TABLE "evaluation_results" DROP CONSTRAINT "FK_4430e307a2b26baefc825c1dfa4"`);
        await queryRunner.query(`ALTER TABLE "evaluation_results" DROP CONSTRAINT "FK_bfe5b207264889299a20563c753"`);
        await queryRunner.query(`ALTER TABLE "question_answers" DROP CONSTRAINT "FK_2e73c38a52d2633171fab07acfd"`);
        await queryRunner.query(`ALTER TABLE "question_answers" DROP CONSTRAINT "FK_941b909bd831f96c46d389ccde4"`);
        await queryRunner.query(`ALTER TABLE "question_answers" DROP CONSTRAINT "FK_c55d674afab6d6305568007512e"`);
        await queryRunner.query(`DROP TABLE "answers"`);
        await queryRunner.query(`DROP TABLE "answer_profiles"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TABLE "dimensions"`);
        await queryRunner.query(`DROP TABLE "evaluation_results"`);
        await queryRunner.query(`DROP TABLE "evaluations"`);
        await queryRunner.query(`DROP TABLE "question_answers"`);
    }

}
