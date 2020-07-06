import { Message } from '../entities/message.entity';
import { EntityRepository } from 'typeorm';
import { CommonBaseRepository } from '../../common/classes/common-base-repository.class';

@EntityRepository(Message)
export class MessagesRepository extends CommonBaseRepository<Message> {}
