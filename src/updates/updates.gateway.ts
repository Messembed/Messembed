import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { UpdateDocument } from './schemas/update.schema';
import { UpdateDto } from './dto/update.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageThroughWebSocketDto } from '../messages/dto/create-message-through-websocket.dto';
import { Types } from 'mongoose';
import { SendWritingIndicatorDto } from '../chats/dto/send-writing-indicator.dto';
import { ChatsService } from '../chats/chats.service';

@WebSocketGateway({
  transports: ['websocket', 'polling'],
})
export class UpdatesGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
  ) {}

  /**
   * userId => Socket[]
   */
  private connectedSockets: Record<string, Socket[]> = {};

  async handleConnection(socket: Socket): Promise<void> {
    await this.authSocket(socket);

    const user = (socket.request.user as RequestAuthData).user;

    if (this.connectedSockets[user._id]) {
      this.connectedSockets[user._id].push(socket);
    } else {
      this.connectedSockets[user._id] = [socket];
    }
  }

  handleDisconnect(socket: Socket): void {
    const user = (socket.request.user as RequestAuthData).user;

    if (this.connectedSockets[user._id]) {
      _.pull(this.connectedSockets[user._id], socket);
    }
  }

  public sendUpdate(userId: string, update: UpdateDocument): void {
    const sockets = this.connectedSockets[userId];

    if (!sockets) {
      return;
    }

    const updateDto = UpdateDto.fromUpdate(update, userId);

    sockets.forEach(socket => {
      socket.emit('new_update', updateDto);
    });
  }

  @SubscribeMessage('send_writing')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async sendWritingIndicator(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { chatId }: SendWritingIndicatorDto,
  ): Promise<void> {
    const user = (socket.request.user as RequestAuthData).user;

    const chat = await this.chatsService.getChatFromMongoOrFailHttp(
      Types.ObjectId.createFromHexString(chatId),
    );

    const companionsId =
      chat.firstCompanion._id === user._id
        ? chat.secondCompanion._id
        : chat.firstCompanion._id;

    const sockets = this.connectedSockets[companionsId];

    if (!sockets) {
      return;
    }

    sockets.forEach(socket => {
      socket.emit('writing', {
        chatId,
      });
    });
  }

  @SubscribeMessage('send_message')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async sendNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createMessageData: CreateMessageThroughWebSocketDto,
  ): Promise<void> {
    const user = (socket.request.user as RequestAuthData).user;

    await this.messagesService.createMessageInMongo({
      ...createMessageData,
      chatId: Types.ObjectId.createFromHexString(createMessageData.chatId),
      userId: user._id,
    });
  }

  private async authSocket(socket: Socket): Promise<void> {
    const payload = await this.jwtService.verifyAsync(
      socket.handshake.query.token,
    );
    const user = await this.usersService.findOneUserFromMongoOrFail(
      payload.sub,
    );

    socket.request.user = new RequestAuthData({
      externalService: null,
      isExternalService: false,
      user,
    });
  }
}
