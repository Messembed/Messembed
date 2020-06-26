import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Messages1593208185294 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'messages',
      indices: [
        {
          name: 'IX_messages_deletedAt',
          columnNames: ['deletedAt'],
        },
        {
          name: 'IX_messages_chatId',
          columnNames: ['chatId'],
        },
        {
          name: 'IX_messages_userId',
          columnNames: ['userId'],
        },
        {
          name: 'IX_messages_read',
          columnNames: ['read'],
        },
      ],
      foreignKeys: [
        {
          name: 'FK_messages_chatId',
          columnNames: ['chatId'],
          referencedTableName: 'chats',
          referencedColumnNames: ['id'],
        },
        {
          name: 'FK_messages_userId',
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
          type: 'integer',
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
