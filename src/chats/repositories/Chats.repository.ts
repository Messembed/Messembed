import { EntityRepository } from 'typeorm';
import { Chat } from '../entities/Chat.entity';
import { CommonBaseRepository } from '../../common/classes/CommonBaseRepository.class';

@EntityRepository(Chat)
export class ChatsRepository extends CommonBaseRepository<Chat> {}
