import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ChatsSoftDelete1593176067597 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'chats',
      new TableColumn({
        name: 'deletedAt',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'chats',
      new TableIndex({
        name: 'IX_chats_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chats', 'deletedAt');
  }
}
