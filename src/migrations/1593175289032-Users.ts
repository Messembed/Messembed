import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Users1593175289032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'users',
      indices: [
        {
          name: 'IX_users_deletedAt',
          columnNames: ['deletedAt'],
        },
        {
          name: 'IX_users_createdAt',
          columnNames: ['createdAt'],
        },
        {
          name: 'UQ_users_externalId_wo_deleted',
          columnNames: ['externalId'],
          isUnique: true,
          where: '"deletedAt" IS NULL',
        },
      ],
      columns: [
        {
          name: 'id',
          type: 'integer',
          isPrimary: true,
          isGenerated: true,
          isNullable: false,
        },
        {
          name: 'createdAt',
          type: 'timestamptz',
          default: 'NOW()',
          isNullable: false,
        },
        {
          name: 'updatedAt',
          type: 'timestamptz',
          default: 'NOW()',
          isNullable: false,
        },
        {
          name: 'deletedAt',
          type: 'timestamptz',
          isNullable: true,
        },
        {
          name: 'externalId',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'externalMetadata',
          type: 'jsonb',
          isNullable: true,
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
