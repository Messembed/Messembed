import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameChatCompanionsColumns1593308476214
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('chats', 'initiatorId', 'firstCompanionId');
    await queryRunner.renameColumn('chats', 'companionId', 'secondCompanionId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('chats', 'firstCompanionId', 'initiatorId');
    await queryRunner.renameColumn('chats', 'secondCompanionId', 'companionId');
  }
}
