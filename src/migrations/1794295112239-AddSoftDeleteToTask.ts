import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToTask1794295112239 implements MigrationInterface {
    name = 'AddSoftDeleteToTask1794295112239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`isDeleted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`isDeleted\``);
    }

}
