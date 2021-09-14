import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1631633060918 implements MigrationInterface {
    name = 'Initial1631633060918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users\` ADD \`image_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users\` ADD UNIQUE INDEX \`IDX_b1aae736b7c5d6925efa856352\` (\`image_id\`)`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` ADD \`image_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` ADD UNIQUE INDEX \`IDX_217fec04790b49d9c346225665\` (\`image_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_b1aae736b7c5d6925efa856352\` ON \`nestjs_blog\`.\`users\` (\`image_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_217fec04790b49d9c346225665\` ON \`nestjs_blog\`.\`posts\` (\`image_id\`)`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users\` ADD CONSTRAINT \`FK_b1aae736b7c5d6925efa8563527\` FOREIGN KEY (\`image_id\`) REFERENCES \`nestjs_blog\`.\`images\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` ADD CONSTRAINT \`FK_217fec04790b49d9c346225665e\` FOREIGN KEY (\`image_id\`) REFERENCES \`nestjs_blog\`.\`images\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` DROP FOREIGN KEY \`FK_217fec04790b49d9c346225665e\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users\` DROP FOREIGN KEY \`FK_b1aae736b7c5d6925efa8563527\``);
        await queryRunner.query(`DROP INDEX \`REL_217fec04790b49d9c346225665\` ON \`nestjs_blog\`.\`posts\``);
        await queryRunner.query(`DROP INDEX \`REL_b1aae736b7c5d6925efa856352\` ON \`nestjs_blog\`.\`users\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` DROP INDEX \`IDX_217fec04790b49d9c346225665\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` DROP COLUMN \`image_id\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users\` DROP INDEX \`IDX_b1aae736b7c5d6925efa856352\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users\` DROP COLUMN \`image_id\``);
    }

}
