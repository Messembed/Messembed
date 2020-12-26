import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { Model, Types } from 'mongoose';
import { UserMongo, UserMongoDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorGenerator } from '../common/classes/error-generator.class';
import { PaginatedUserInMongoDto } from './dto/paginated-user-in-mongo.dto';
import { MongoErrorCodes } from '../common/constants/mongo-error-codes.enum';

@Injectable()
export class UsersService {
  constructor(
    public readonly usersRepo: UsersRepository,
    @InjectModel(UserMongo.name)
    private readonly userModel: Model<UserMongoDocument>,
  ) {}

  async createUser(createDto: CreateUserDto): Promise<User> {
    const user = new User(createDto);

    await this.usersRepo.save(user);

    return user;
  }

  async createUserInMongo(
    createDto: CreateUserDto,
  ): Promise<UserMongoDocument> {
    try {
      const user = await this.userModel.create({
        externalId: createDto.id,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        externalMetadata: createDto.externalMetadata,
        privateExternalMetadata: createDto.privateExternalMetadata,
      });
      return user;
    } catch (error) {
      if (error && error.code === MongoErrorCodes.DUPLICATE_KEY) {
        throw ErrorGenerator.create('USER_ID_IS_NOT_UNIQUE');
      }

      throw error;
    }
  }

  async editUser(userId: string, editDto: EditUserDto): Promise<User> {
    const user = await this.usersRepo.findOneOrFailHttp(userId);

    this.usersRepo.merge(user, editDto);
    await this.usersRepo.save(user);

    return user;
  }

  async editUserInMongo(
    userId: string,
    editDto: EditUserDto,
  ): Promise<UserMongoDocument> {
    const user = await this.userModel.findOne({
      externalId: userId,
      deletedAt: null,
    });

    if (!user) {
      throw ErrorGenerator.create('USER_NOT_FOUND');
    }

    user.externalMetadata = editDto.externalMetadata;
    user.privateExternalMetadata = editDto.privateExternalMetadata;
    await user.save();

    return user;
  }

  async getUser(userId: string): Promise<User> {
    return this.usersRepo.findOneOrFailHttp(userId);
  }

  async getUserFromMongo(userId: string): Promise<UserMongoDocument> {
    const user = await this.userModel.findOne({
      externalId: userId,
      deletedAt: null,
    });

    if (!user) {
      throw ErrorGenerator.create('USER_NOT_FOUND');
    }

    return user;
  }

  async findAllUsers(): Promise<PaginatedUsersDto> {
    const [users, totalCount] = await this.usersRepo.findAndCount();

    return new PaginatedUsersDto(users, totalCount);
  }

  async findAllUsersFromMongo(): Promise<PaginatedUserInMongoDto> {
    const users = await this.userModel.find({ deletedAt: null });
    const totalCount = await this.userModel.count({ deletedAt: null });

    return new PaginatedUserInMongoDto(users, totalCount);
  }

  async findOneUserFromMongoOrFail(
    userId: string | Types.ObjectId,
  ): Promise<UserMongoDocument> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new Error(`User not found with id ${userId}`);
    }

    return user;
  }
}
