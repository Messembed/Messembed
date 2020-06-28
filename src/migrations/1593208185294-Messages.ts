import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Messages1593208185294 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'messages',
      indices: [
        {
          columnNames: ['deletedAt'],
        },
        {
          columnNames: ['chatId'],
        },
        {
          columnNames: ['userId'],
        },
        {
          columnNames: ['read'],
        },
      ],
      foreignKeys: [
        {
          columnNames: ['chatId'],
          referencedTableName: 'chats',
          referencedColumnNames: ['id'],
        },
        {
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
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
          name: 'editedAt',
          type: 'timestamptz',
          isNullable: true,
        },
        {
          name: 'chatId',
          type: 'integer',
          isNullable: false,
        },
        {
          name: 'userId',
          type: 'varchar(128)',
          isNullable: false,
        },
        {
          name: 'content',
          type: 'text',
          isNullable: false,
        },
        {
          name: 'read',
          type: 'boolean',
          default: false,
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
    await queryRunner.dropTable('messages');
  }
}
