import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { EntityRepository } from 'typeorm';
import { Chat } from '../entities/Chat.entity';

@EntityRepository(Chat)
export class ChatRepository extends BaseRepository<Chat> {}
