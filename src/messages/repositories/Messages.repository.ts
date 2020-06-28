import { Message } from '../entities/Message.entity';
import { EntityRepository } from 'typeorm';
import { CommonBaseRepository } from '../../common/classes/CommonBaseRepository.class';

@EntityRepository(Message)
export class MessagesRepository extends CommonBaseRepository<Message> {}
