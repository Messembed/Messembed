import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChatsLastMessageId1593278372098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'chats',
      new TableColumn({
        name: 'lastMessageId',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chats', 'lastMessageId');
  }
}
