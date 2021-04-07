import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { Model } from 'mongoose';
import { UserMongo, UserMongoDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorGenerator } from '../common/classes/error-generator.class';
import { PaginatedUserInMongoDto } from './dto/paginated-user-in-mongo.dto';
import { MongoErrorCodes } from '../common/constants/mongo-error-codes.enum';
import { ChatsService } from '../chats/chats.service';
import _ from 'lodash';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserMongo.name)
    private readonly userModel: Model<UserMongoDocument>,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
  ) {}

  async createUser(createDto: CreateUserDto): Promise<UserMongoDocument> {
    try {
      const user = await this.userModel.create({
        _id: createDto.id,
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

  async editUser(
    userId: string,
    editDto: EditUserDto,
  ): Promise<UserMongoDocument> {
    const user = await this.userModel.findOne({
      _id: userId,
      deletedAt: null,
    });

    if (!user) {
      throw ErrorGenerator.create('USER_NOT_FOUND');
    }

    if (!_.isNil(editDto.externalMetadata)) {
      user.externalMetadata = editDto.externalMetadata;
    }

    if (!_.isNil(editDto.privateExternalMetadata)) {
      user.privateExternalMetadata = editDto.privateExternalMetadata;
    }

    await user.save();

    // TODO: after this method send update to inform users that this user has been edited
    await this.chatsService.updateUserInChats(user);

    return user;
  }

  async getUser(userId: string): Promise<UserMongoDocument> {
    const user = await this.userModel.findOne({
      _id: userId,
      deletedAt: null,
    });

    if (!user) {
      throw ErrorGenerator.create('USER_NOT_FOUND');
    }

    return user;
  }

  async getAllUsers(): Promise<PaginatedUserInMongoDto> {
    const users = await this.userModel.find({ deletedAt: null });
    const totalCount = await this.userModel.count({ deletedAt: null });

    return new PaginatedUserInMongoDto(users, totalCount);
  }

  async getUserByIdOrFail(userId: string): Promise<UserMongoDocument> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new Error(`User not found with id ${userId}`);
    }

    return user;
  }
}
