import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTags1794451039710 implements MigrationInterface {
    name = 'AddTags1794451039710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tasks_tags_tags\` (\`tasksId\` int NOT NULL, \`tagsId\` int NOT NULL, INDEX \`IDX_791bc3e522e77386d2186ec760\` (\`tasksId\`), INDEX \`IDX_8f2ff7a27728781da1a1f944f7\` (\`tagsId\`), PRIMARY KEY (\`tasksId\`, \`tagsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tasks_tags_tags\` ADD CONSTRAINT \`FK_791bc3e522e77386d2186ec7604\` FOREIGN KEY (\`tasksId\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tasks_tags_tags\` ADD CONSTRAINT \`FK_8f2ff7a27728781da1a1f944f78\` FOREIGN KEY (\`tagsId\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks_tags_tags\` DROP FOREIGN KEY \`FK_8f2ff7a27728781da1a1f944f78\``);
        await queryRunner.query(`ALTER TABLE \`tasks_tags_tags\` DROP FOREIGN KEY \`FK_791bc3e522e77386d2186ec7604\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f2ff7a27728781da1a1f944f7\` ON \`tasks_tags_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_791bc3e522e77386d2186ec760\` ON \`tasks_tags_tags\``);
        await queryRunner.query(`DROP TABLE \`tasks_tags_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
    }

}
