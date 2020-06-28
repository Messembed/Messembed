import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Users1593175289032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'users',
      indices: [{ columnNames: ['deletedAt'] }, { columnNames: ['createdAt'] }],
      columns: [
        {
          name: 'id',
          type: 'varchar(128)',
          isPrimary: true,
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
