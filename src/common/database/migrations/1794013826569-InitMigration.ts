import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1794013826569 implements MigrationInterface {
    name = 'InitMigration1794013826569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "age_range" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "gender_identity" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "vulnerable_groups" text array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "origin" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "has_care_responsibilities" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "care_responsibilities_details" text array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "activity_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "sector" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "position" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "answers" ADD "is_not_applicable" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answers" DROP COLUMN "is_not_applicable"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "sector"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "activity_type"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "care_responsibilities_details"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "has_care_responsibilities"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "origin"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "vulnerable_groups"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "gender_identity"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "age_range"`);
    }

}
