import { User } from '../entities/User.entity';
import { EntityRepository } from 'typeorm';
import { CommonBaseRepository } from '../../common/classes/CommonBaseRepository.class';

@EntityRepository(User)
export class UsersRepository extends CommonBaseRepository<User> {}
