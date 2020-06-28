import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/Users.repository';
import { CreateUserDto } from './dto/CreateUser.dto';
import { User } from './entities/User.entity';
import { EditUserDto } from './dto/EditUser.dto';
import { PaginatedUsersDto } from './dto/PaginatedUsers.dto';

@Injectable()
export class UsersService {
  constructor(public readonly usersRepo: UsersRepository) {}

  async createUser(createDto: CreateUserDto): Promise<User> {
    const user = new User(createDto);

    await this.usersRepo.save(user);

    return user;
  }

  async editUser(userId: number | string, editDto: EditUserDto): Promise<User> {
    const user = await this.usersRepo.findOneOrFailHttp(userId);

    this.usersRepo.merge(user, editDto);
    await this.usersRepo.save(user);

    return user;
  }

  async getUser(userId: number | string): Promise<User> {
    return this.usersRepo.findOneOrFailHttp(userId);
  }

  async findAllUsers(): Promise<PaginatedUsersDto> {
    const [users, totalCount] = await this.usersRepo.findAndCount();

    return new PaginatedUsersDto(users, totalCount);
  }
}
