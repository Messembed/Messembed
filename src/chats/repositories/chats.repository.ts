import { EntityRepository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { CommonBaseRepository } from '../../common/classes/common-base-repository.class';

@EntityRepository(Chat)
export class ChatsRepository extends CommonBaseRepository<Chat> {}
