import { MigrationInterface, QueryRunner } from "typeorm";

export class Bbb1708481763261 implements MigrationInterface {
    name = 'Bbb1708481763261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`new_user\` ADD \`email\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`new_user\` DROP COLUMN \`email\``);
    }

}
