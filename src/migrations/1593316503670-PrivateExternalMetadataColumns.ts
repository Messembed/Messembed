import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class PrivateExternalMetadataColumns1593316503670
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'chats',
      new TableColumn({
        name: 'privateExternalMetadata',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'privateExternalMetadata',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'messages',
      new TableColumn({
        name: 'privateExternalMetadata',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chats', 'privateExternalMetadata');
    await queryRunner.dropColumn('users', 'privateExternalMetadata');
    await queryRunner.dropColumn('messages', 'privateExternalMetadata');
  }
}
