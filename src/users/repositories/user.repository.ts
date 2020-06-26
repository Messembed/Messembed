import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { User } from '../entities/User.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {}
