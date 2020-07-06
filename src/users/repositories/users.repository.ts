import { User } from '../entities/user.entity';
import { EntityRepository } from 'typeorm';
import { CommonBaseRepository } from '../../common/classes/common-base-repository.class';

@EntityRepository(User)
export class UsersRepository extends CommonBaseRepository<User> {}
