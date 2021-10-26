import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatsService } from '../chats/chats.service';
import { CreateUpdateInput } from './interfaces/create-update-input.interface';
import { UpdateDto } from './dto/update.dto';
import { UpdateModel, UpdateDocument } from './schemas/update.schema';
import { UpdatesGateway } from './updates.gateway';
import { UserDocument } from '../users/schemas/user.schema';

interface CreateUpdateOptions {
  /**
   * If update is broadcasted to a chat you can
   * exclude some users from getting this update,
   * for example if the user is blocked from getting new messages
   */
  excludeUsersFromBroadcast?: string[];
}

@Injectable()
export class UpdatesService {
  constructor(
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    @InjectModel(UpdateModel.name)
    private readonly updateModel: Model<UpdateDocument>,
    private readonly updatesGateway: UpdatesGateway,
  ) {}

  async getUpdatesForUser(
    currentUser: UserDocument,
    creationDateOfLastFetchedUpdate: Date,
  ): Promise<UpdateDto[]> {
    const idsOfChatsOfCurrentUser = await this.chatsService.listIdsOfChatsOfUser(
      currentUser._id,
    );

    const additionalCreatedAt =
      currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' &&
      currentUser.blockStatusUpdatedAt
        ? { $lt: currentUser.blockStatusUpdatedAt }
        : {};

    const updates = await this.updateModel.find({
      chatId: { $in: idsOfChatsOfCurrentUser },
      createdAt: {
        $gt: creationDateOfLastFetchedUpdate,
        ...additionalCreatedAt,
      },
    });

    return UpdateDto.fromUpdates(updates, currentUser._id);
  }

  async createUpdate(
    data: CreateUpdateInput,
    options?: CreateUpdateOptions,
  ): Promise<UpdateDocument> {
    const update = await this.updateModel.create({
      _id: new Types.ObjectId(),
      createdAt: data.chat
        ? data.chat.createdAt
        : data.message
        ? data.message.createdAt
        : new Date(),
      chatId: data.chatId,
      chat: data.chat,
      message: data.message,
      type: data.type,
    });

    const chat = await this.chatsService.getChatByIdOrCompanionsIdsOrFailHttp(
      update.chatId,
    );

    if (
      !options?.excludeUsersFromBroadcast?.includes(chat.firstCompanion._id)
    ) {
      this.updatesGateway.sendUpdate(chat.firstCompanion._id, update);
    }

    if (
      !options?.excludeUsersFromBroadcast?.includes(chat.secondCompanion._id)
    ) {
      this.updatesGateway.sendUpdate(chat.secondCompanion._id, update);
    }

    return update;
  }
}
