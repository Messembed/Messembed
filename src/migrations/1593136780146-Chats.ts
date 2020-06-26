import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Chats1593136780146 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'chats',
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
          name: 'title',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'active',
          type: 'boolean',
          default: true,
          isNullable: false,
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chats');
  }
}
