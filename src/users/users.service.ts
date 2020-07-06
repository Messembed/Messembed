import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';

@Injectable()
export class UsersService {
  constructor(public readonly usersRepo: UsersRepository) {}

  async createUser(createDto: CreateUserDto): Promise<User> {
    const user = new User(createDto);

    await this.usersRepo.save(user);

    return user;
  }

  async editUser(userId: string, editDto: EditUserDto): Promise<User> {
    const user = await this.usersRepo.findOneOrFailHttp(userId);

    this.usersRepo.merge(user, editDto);
    await this.usersRepo.save(user);

    return user;
  }

  async getUser(userId: string): Promise<User> {
    return this.usersRepo.findOneOrFailHttp(userId);
  }

  async findAllUsers(): Promise<PaginatedUsersDto> {
    const [users, totalCount] = await this.usersRepo.findAndCount();

    return new PaginatedUsersDto(users, totalCount);
  }
}
