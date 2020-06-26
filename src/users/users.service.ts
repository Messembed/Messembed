import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/CreateUser.dto';
import { User } from './entities/User.entity';
import { EditUserDto } from './dto/EditUser.dto';
import { ErrorGenerator } from '../common/classes/ErrorGenerator.class';
import { PaginatedUsersDto } from './dto/PaginatedUsers.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(createDto: CreateUserDto): Promise<User> {
    const user = new User(createDto);

    await this.userRepo.save(user);

    return user;
  }

  async editUser(userId: number | string, editDto: EditUserDto): Promise<User> {
    const user = await this.findUserOrFail(userId);

    this.userRepo.merge(user, editDto);
    await this.userRepo.save(user);

    return user;
  }

  async getUser(userId: number | string): Promise<User> {
    return this.findUserOrFail(userId);
  }

  async findAllUsers(): Promise<PaginatedUsersDto> {
    const [users, totalCount] = await this.userRepo.findAndCount();

    return new PaginatedUsersDto(users, totalCount);
  }

  async findUserOrFail(userId: string | number): Promise<User> {
    const user = await this.userRepo.findOne(userId);

    if (!user) {
      throw ErrorGenerator.create('USER_NOT_FOUND');
    }

    return user;
  }
}
