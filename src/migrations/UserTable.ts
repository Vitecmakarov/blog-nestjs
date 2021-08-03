import { MigrationInterface, QueryRunner, Table } from 'typeorm';
export class UserTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: false,
            isNullable: false,
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'mobile',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'passwordHash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'registeredAt',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'lastLogin',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'profileDesc',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'blob',
            isNullable: true,
          },
          {
            name: 'isBanned',
            type: 'boolean',
            isNullable: false,
          },
        ],
      }),
      false,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE user`);
  }
}
