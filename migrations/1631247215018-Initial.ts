import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1631247215018 implements MigrationInterface {
    name = 'Initial1631247215018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`users_images\` (\`id\` char(36) NOT NULL, \`path\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`extension\` varchar(255) NOT NULL, \`upload_timestamp\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` char(36) NULL, UNIQUE INDEX \`IDX_8536be2ec362fffc6a1cd6480d\` (\`path\`), UNIQUE INDEX \`REL_23bcc9300a18cab378cb7b0653\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`users_grades\` (\`id\` char(36) NOT NULL, \`grade\` int(1) NOT NULL, \`estimator_id\` char(36) NULL, \`evaluated_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`posts_grades\` (\`id\` char(36) NOT NULL, \`grade\` int(1) NOT NULL, \`estimator_id\` char(36) NULL, \`evaluated_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`posts_comments_grades\` (\`id\` char(36) NOT NULL, \`grade\` int(1) NOT NULL, \`estimator_id\` char(36) NULL, \`evaluated_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`posts_comments\` (\`id\` char(36) NOT NULL, \`content\` text NOT NULL, \`likes_count\` int NOT NULL DEFAULT '0', \`dislikes_count\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` char(36) NULL, \`post_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`users\` (\`id\` char(36) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`last_name\` varchar(50) NOT NULL, \`mobile\` varchar(15) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`profile_desc\` varchar(100) NULL, \`rating\` float NOT NULL DEFAULT '0', \`register_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`last_login\` timestamp NULL, UNIQUE INDEX \`IDX_d376a9f93bba651f32a2c03a7d\` (\`mobile\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`posts_images\` (\`id\` char(36) NOT NULL, \`path\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`extension\` varchar(255) NOT NULL, \`upload_timestamp\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`post_id\` char(36) NULL, UNIQUE INDEX \`IDX_fa24d12410b92b2d5460a2f533\` (\`path\`), UNIQUE INDEX \`REL_a147871539f40cffc2f53c25ef\` (\`post_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`posts\` (\`id\` char(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`content\` text NOT NULL, \`rating\` float NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`categories\` (\`id\` char(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`mpath\` varchar(255) NULL DEFAULT '', \`user_id\` char(36) NULL, \`parentId\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nestjs_blog\`.\`posts_categories\` (\`post\` char(36) NOT NULL, \`category\` char(36) NOT NULL, INDEX \`IDX_49dcc86e3c24a161851447b1c8\` (\`post\`), INDEX \`IDX_3e42f8cab05b4221f7dba178a1\` (\`category\`), PRIMARY KEY (\`post\`, \`category\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users_images\` ADD CONSTRAINT \`FK_23bcc9300a18cab378cb7b0653c\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users_grades\` ADD CONSTRAINT \`FK_9ee783062ec8200684b3a5c5f40\` FOREIGN KEY (\`estimator_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users_grades\` ADD CONSTRAINT \`FK_7446ff940460be882f0be7e629a\` FOREIGN KEY (\`evaluated_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_grades\` ADD CONSTRAINT \`FK_9aaab356e18a85389ae94fcf062\` FOREIGN KEY (\`estimator_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_grades\` ADD CONSTRAINT \`FK_575e8647e375e9bf01bcb2665ba\` FOREIGN KEY (\`evaluated_id\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments_grades\` ADD CONSTRAINT \`FK_aa60beaf1641c87bba325d4992f\` FOREIGN KEY (\`estimator_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments_grades\` ADD CONSTRAINT \`FK_67101a11da1f58367c99aebb48a\` FOREIGN KEY (\`evaluated_id\`) REFERENCES \`nestjs_blog\`.\`posts_comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments\` ADD CONSTRAINT \`FK_12dd7ee15b49175bab802da332b\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments\` ADD CONSTRAINT \`FK_14c9080415c397e35453e432980\` FOREIGN KEY (\`post_id\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_images\` ADD CONSTRAINT \`FK_a147871539f40cffc2f53c25ef0\` FOREIGN KEY (\`post_id\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` ADD CONSTRAINT \`FK_c4f9a7bd77b489e711277ee5986\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`categories\` ADD CONSTRAINT \`FK_2296b7fe012d95646fa41921c8b\` FOREIGN KEY (\`user_id\`) REFERENCES \`nestjs_blog\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`categories\` ADD CONSTRAINT \`FK_9a6f051e66982b5f0318981bcaa\` FOREIGN KEY (\`parentId\`) REFERENCES \`nestjs_blog\`.\`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_categories\` ADD CONSTRAINT \`FK_49dcc86e3c24a161851447b1c88\` FOREIGN KEY (\`post\`) REFERENCES \`nestjs_blog\`.\`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_categories\` ADD CONSTRAINT \`FK_3e42f8cab05b4221f7dba178a15\` FOREIGN KEY (\`category\`) REFERENCES \`nestjs_blog\`.\`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_categories\` DROP FOREIGN KEY \`FK_3e42f8cab05b4221f7dba178a15\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_categories\` DROP FOREIGN KEY \`FK_49dcc86e3c24a161851447b1c88\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`categories\` DROP FOREIGN KEY \`FK_9a6f051e66982b5f0318981bcaa\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`categories\` DROP FOREIGN KEY \`FK_2296b7fe012d95646fa41921c8b\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts\` DROP FOREIGN KEY \`FK_c4f9a7bd77b489e711277ee5986\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_images\` DROP FOREIGN KEY \`FK_a147871539f40cffc2f53c25ef0\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments\` DROP FOREIGN KEY \`FK_14c9080415c397e35453e432980\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments\` DROP FOREIGN KEY \`FK_12dd7ee15b49175bab802da332b\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments_grades\` DROP FOREIGN KEY \`FK_67101a11da1f58367c99aebb48a\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_comments_grades\` DROP FOREIGN KEY \`FK_aa60beaf1641c87bba325d4992f\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_grades\` DROP FOREIGN KEY \`FK_575e8647e375e9bf01bcb2665ba\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`posts_grades\` DROP FOREIGN KEY \`FK_9aaab356e18a85389ae94fcf062\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users_grades\` DROP FOREIGN KEY \`FK_7446ff940460be882f0be7e629a\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users_grades\` DROP FOREIGN KEY \`FK_9ee783062ec8200684b3a5c5f40\``);
        await queryRunner.query(`ALTER TABLE \`nestjs_blog\`.\`users_images\` DROP FOREIGN KEY \`FK_23bcc9300a18cab378cb7b0653c\``);
        await queryRunner.query(`DROP INDEX \`IDX_3e42f8cab05b4221f7dba178a1\` ON \`nestjs_blog\`.\`posts_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_49dcc86e3c24a161851447b1c8\` ON \`nestjs_blog\`.\`posts_categories\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts_categories\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`categories\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts\``);
        await queryRunner.query(`DROP INDEX \`REL_a147871539f40cffc2f53c25ef\` ON \`nestjs_blog\`.\`posts_images\``);
        await queryRunner.query(`DROP INDEX \`IDX_fa24d12410b92b2d5460a2f533\` ON \`nestjs_blog\`.\`posts_images\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts_images\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`nestjs_blog\`.\`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_d376a9f93bba651f32a2c03a7d\` ON \`nestjs_blog\`.\`users\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`users\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts_comments\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts_comments_grades\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`posts_grades\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`users_grades\``);
        await queryRunner.query(`DROP INDEX \`REL_23bcc9300a18cab378cb7b0653\` ON \`nestjs_blog\`.\`users_images\``);
        await queryRunner.query(`DROP INDEX \`IDX_8536be2ec362fffc6a1cd6480d\` ON \`nestjs_blog\`.\`users_images\``);
        await queryRunner.query(`DROP TABLE \`nestjs_blog\`.\`users_images\``);
    }

}
