import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1628777120466 implements MigrationInterface {
  name = 'Init1628777120466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`images\` (\`id\` varchar(255) NOT NULL, \`path\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`extension\` varchar(255) NOT NULL, \`upload_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`post_id\` varchar(255) NULL, \`comment_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`users\` (\`id\` varchar(255) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`last_name\` varchar(50) NOT NULL, \`mobile\` varchar(15) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`register_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`last_login\` timestamp NULL, \`profile_desc\` varchar(100) NULL, \`is_banned\` tinyint NOT NULL DEFAULT 0, \`avatar_id\` varchar(255) NULL, UNIQUE INDEX \`REL_c3401836efedec3bec459c8f81\` (\`avatar_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`comments\` (\`id\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`create_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`update_timestamp\` timestamp NULL, \`publish_timestamp\` timestamp NULL, \`user_id\` varchar(255) NULL, \`post_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`posts\` (\`id\` varchar(255) NOT NULL, \`title\` varchar(100) NOT NULL, \`content\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NULL, \`published_at\` timestamp NULL, \`user_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`categories\` (\`id\` varchar(255) NOT NULL, \`title\` varchar(100) NOT NULL, \`user_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nestjs_blog\`.\`posts_categories_categories\` (\`postsId\` varchar(255) NOT NULL, \`categoriesId\` varchar(255) NOT NULL, INDEX \`IDX_f50a96e3d32263cc97588d91d6\` (\`postsId\`), INDEX \`IDX_bb4ea8658b6d38df2a5f93cd50\` (\`categoriesId\`), PRIMARY KEY (\`postsId\`, \`categoriesId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` ADD CONSTRAINT \`FK_ca0ed9873891665fff3d9d39cc2\` FOREIGN KEY (\`post_id\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` ADD CONSTRAINT \`FK_2d46215c11b52f2bb90200bb46d\` FOREIGN KEY (\`comment_id\`) REFERENCES \`nestjs_blog\`.\`comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`users\` ADD CONSTRAINT \`FK_c3401836efedec3bec459c8f818\` FOREIGN KEY (\`avatar_id\`) REFERENCES \`nestjs_blog\`.\`images\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories_categories\` ADD CONSTRAINT \`FK_f50a96e3d32263cc97588d91d6e\` FOREIGN KEY (\`postsId\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories_categories\` ADD CONSTRAINT \`FK_bb4ea8658b6d38df2a5f93cd506\` FOREIGN KEY (\`categoriesId\`) REFERENCES \`nestjs_blog\`.\`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories_categories\` DROP FOREIGN KEY \`FK_bb4ea8658b6d38df2a5f93cd506\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`posts_categories_categories\` DROP FOREIGN KEY \`FK_f50a96e3d32263cc97588d91d6e\``,
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
      `ALTER TABLE \`nestjs_blog\`.\`users\` DROP FOREIGN KEY \`FK_c3401836efedec3bec459c8f818\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` DROP FOREIGN KEY \`FK_2d46215c11b52f2bb90200bb46d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`nestjs_blog\`.\`images\` DROP FOREIGN KEY \`FK_ca0ed9873891665fff3d9d39cc2\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bb4ea8658b6d38df2a5f93cd50\` ON \`nestjs_blog\`.\`posts_categories_categories\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f50a96e3d32263cc97588d91d6\` ON \`nestjs_blog\`.\`posts_categories_categories\``,
    );
    await queryRunner.query(
      `DROP TABLE \`nestjs_blog\`.\`posts_categories_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`categories\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`comments\``);
    await queryRunner.query(
      `DROP INDEX \`REL_c3401836efedec3bec459c8f81\` ON \`nestjs_blog\`.\`users\``,
    );
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`users\``);
    await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`images\``);
  }
}
