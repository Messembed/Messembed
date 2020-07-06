import { FindOneOptions, FindConditions, ObjectID } from 'typeorm';
import { ErrorGenerator, ErrorCode } from './error-generator.class';
import { Type } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';

const entitiesMappedToErrorCodes = new Map<Type<any>, ErrorCode>([
  [User, 'USER_NOT_FOUND'],
  [Chat, 'CHAT_NOT_FOUND'],
]);

export class CommonBaseRepository<Entity> extends BaseRepository<Entity> {
  findOneOrFailHttp(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity>;

  findOneOrFailHttp(options?: FindOneOptions<Entity>): Promise<Entity>;

  findOneOrFailHttp(
    conditions?: FindConditions<Entity>,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity>;

  async findOneOrFailHttp(
    idOrOptionsOrConditions?:
      | string
      | number
      | FindOneOptions<Entity>
      | FindConditions<Entity>
      | Date
      | ObjectID,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    const entity = await this.findOne(idOrOptionsOrConditions as any, options);

    if (!entity) {
      const errorCode: ErrorCode =
        entitiesMappedToErrorCodes.get(this.target as any) || 'NOT_FOUND';

      throw ErrorGenerator.create(errorCode);
    }

    return entity;
  }
}
