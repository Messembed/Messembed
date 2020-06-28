import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class ChatMembersColumnsAndMetadata1593193796301
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('chats', [
      new TableColumn({
        name: 'initiatorId',
        type: 'varchar(128)',
        isNullable: false,
      }),
      new TableColumn({
        name: 'companionId',
        type: 'varchar(128)',
        isNullable: false,
      }),
      new TableColumn({
        name: 'externalMetadata',
        type: 'jsonb',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndices('chats', [
      new TableIndex({
        columnNames: ['initiatorId'],
      }),
      new TableIndex({
        columnNames: ['companionId'],
      }),
    ]);

    await queryRunner.createForeignKeys('chats', [
      new TableForeignKey({
        columnNames: ['initiatorId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['companionId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chats', 'initiatorId');
    await queryRunner.dropColumn('chats', 'companionId');
    await queryRunner.dropColumn('chats', 'externalMetadata');
  }
}
