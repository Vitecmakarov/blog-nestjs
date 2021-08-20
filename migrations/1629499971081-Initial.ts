import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1629499971081 implements MigrationInterface {
  name = 'Initial1629499971081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`images\` (\`id\` char(36) NOT NULL, \`path\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`extension\` varchar(255) NOT NULL, \`upload_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`user_id\` char(36) NULL, \`post_id\` char(36) NULL, UNIQUE INDEX \`REL_decdf86f650fb765dac7bd091a\` (\`user_id\`), UNIQUE INDEX \`REL_ca0ed9873891665fff3d9d39cc\` (\`post_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`users\` (\`id\` char(36) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`last_name\` varchar(50) NOT NULL, \`mobile\` varchar(15) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`register_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`last_login\` timestamp NULL, \`profile_desc\` varchar(100) NULL, \`is_banned\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`comments\` (\`id\` char(36) NOT NULL, \`content\` text NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NULL, \`user_id\` char(36) NULL, \`post_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`posts\` (\`id\` char(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`content\` text NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NULL, \`user_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`categories\` (\`id\` char(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`user_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`posts_categories\` (\`post\` char(36) NOT NULL, \`category\` char(36) NOT NULL, INDEX \`IDX_49dcc86e3c24a161851447b1c8\` (\`post\`), INDEX \`IDX_3e42f8cab05b4221f7dba178a1\` (\`category\`), PRIMARY KEY (\`post\`, \`category\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` ADD CONSTRAINT \`FK_decdf86f650fb765dac7bd091a6\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` ADD CONSTRAINT \`FK_ca0ed9873891665fff3d9d39cc2\` FOREIGN KEY (\`post_id\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`comments\` ADD CONSTRAINT \`FK_4c675567d2a58f0b07cef09c13d\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`comments\` ADD CONSTRAINT \`FK_259bf9825d9d198608d1b46b0b5\` FOREIGN KEY (\`post_id\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts\` ADD CONSTRAINT \`FK_c4f9a7bd77b489e711277ee5986\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`categories\` ADD CONSTRAINT \`FK_2296b7fe012d95646fa41921c8b\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories\` ADD CONSTRAINT \`FK_49dcc86e3c24a161851447b1c88\` FOREIGN KEY (\`post\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories\` ADD CONSTRAINT \`FK_3e42f8cab05b4221f7dba178a15\` FOREIGN KEY (\`category\`) REFERENCES \`nestjs_blog\`.\`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories\` DROP FOREIGN KEY \`FK_3e42f8cab05b4221f7dba178a15\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories\` DROP FOREIGN KEY \`FK_49dcc86e3c24a161851447b1c88\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`categories\` DROP FOREIGN KEY \`FK_2296b7fe012d95646fa41921c8b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts\` DROP FOREIGN KEY \`FK_c4f9a7bd77b489e711277ee5986\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`comments\` DROP FOREIGN KEY \`FK_259bf9825d9d198608d1b46b0b5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`comments\` DROP FOREIGN KEY \`FK_4c675567d2a58f0b07cef09c13d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` DROP FOREIGN KEY \`FK_ca0ed9873891665fff3d9d39cc2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` DROP FOREIGN KEY \`FK_decdf86f650fb765dac7bd091a6\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3e42f8cab05b4221f7dba178a1\` ON \`nestjs_blog\`.\`posts_categories\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_49dcc86e3c24a161851447b1c8\` ON \`nestjs_blog\`.\`posts_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts_categories\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`categories\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`comments\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`users\``);
    await queryRunner.query(
      `DROP INDEX \`REL_ca0ed9873891665fff3d9d39cc\` ON \`nestjs_blog\`.\`images\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_decdf86f650fb765dac7bd091a\` ON \`nestjs_blog\`.\`images\``,
    );
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`images\``);
  }
}
