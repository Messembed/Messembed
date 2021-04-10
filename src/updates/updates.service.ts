import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatsService } from '../chats/chats.service';
import { CreateUpdateInput } from './interfaces/create-update-input.interface';
import { UpdateDto } from './dto/update.dto';
import { UpdateModel, UpdateDocument } from './schemas/update.schema';
import { UpdatesGateway } from './updates.gateway';

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
    currentUserId: string,
    creationDateOfLastFetchedUpdate: Date,
  ): Promise<UpdateDto[]> {
    const idsOfChatsOfCurrentUser = await this.chatsService.listIdsOfChatsOfUser(
      currentUserId,
    );

    const updates = await this.updateModel.find({
      chatId: { $in: idsOfChatsOfCurrentUser },
      createdAt: { $gt: creationDateOfLastFetchedUpdate },
    });

    return UpdateDto.fromUpdates(updates, currentUserId);
  }

  async createUpdate(data: CreateUpdateInput): Promise<UpdateDocument> {
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

    this.updatesGateway.sendUpdate(chat.firstCompanion._id, update);
    this.updatesGateway.sendUpdate(chat.secondCompanion._id, update);

    return update;
  }
}
