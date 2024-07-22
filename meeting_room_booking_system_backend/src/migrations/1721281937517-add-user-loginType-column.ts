import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLoginTypeColumn1721281937517 implements MigrationInterface {
    name = 'AddUserLoginTypeColumn1721281937517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`loginType\` int NOT NULL COMMENT '登录类型, 0 用户密码登录, 1 Google登录, 2 Github登录' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`loginType\``);
    }

}
