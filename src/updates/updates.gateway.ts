import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  forwardRef,
  Inject,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateDocument } from './schemas/update.schema';
import { UpdateDto } from './dto/update.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageThroughWebSocketDto } from '../messages/dto/create-message-through-websocket.dto';
import { Types } from 'mongoose';
import { SendWritingIndicatorDto } from '../chats/dto/send-writing-indicator.dto';
import { ChatsService } from '../chats/chats.service';
import { MarkMessageAsReadThroughWebSocketDto } from '../messages/dto/mark-message-as-read-through-websocket.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { ExternalServiceBasicStrategy } from '../auth/strategies/external-service-basic.strategy';
import { Admin } from '../auth/classes/admin.class';
import { MessageDocument } from '../messages/schemas/message.schema';
import { ChatDocument } from '../chats/schemas/chat.schema';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

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
    @InjectPinoLogger(UpdatesGateway.name)
    private readonly logger: PinoLogger,
    @Inject(forwardRef(() => ExternalServiceBasicStrategy))
    private readonly externalServiceBasicStrategy: ExternalServiceBasicStrategy,
  ) {}

  /**
   * userId => Socket[]
   */
  private connectedSockets: Record<string, Socket[]> = {};

  private connectedSocketsOfAdmin: Socket[] = [];

  async handleConnection(socket: Socket): Promise<void> {
    if (this.doesClientTryingToAuthenticateAsAdmin(socket)) {
      await this.authExternalUser(socket);

      this.connectedSocketsOfAdmin.push(socket);
    } else {
      await this.authSocket(socket);
      const user = socket.request.user as UserDocument;

      if (this.connectedSockets[user._id]) {
        this.connectedSockets[user._id].push(socket);
      } else {
        this.connectedSockets[user._id] = [socket];
      }
    }
  }

  handleDisconnect(socket: Socket): void {
    if (socket.request.user instanceof Admin) {
      _.pull(this.connectedSocketsOfAdmin, socket);
    } else {
      const user = socket.request.user as UserDocument;

      if (!user) {
        return;
      }

      if (this.connectedSockets[user._id]) {
        _.pull(this.connectedSockets[user._id], socket);
      }
    }
  }

  /**
   * Use only to send updates to users, not connected admins.
   */
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

  /**
   * Use only to send updates to admins, not particular users.
   * Useful when the external service (Admin) needs to process messages for analytics
   * or for other needs.
   */
  public sendNewMessageToAdmin(params: {
    message: MessageDocument;
    chat: ChatDocument;
  }): void {
    const data = {
      message: params.message.toJSON(),
      chat: params.chat.toJSON(),
    };

    this.connectedSocketsOfAdmin.forEach(socket => {
      socket.emit('admin__new_message', data);
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
    this.throwIfAdmin(socket);

    const user = socket.request.user as UserDocument;

    const chat = await this.chatsService.getChatByIdOrCompanionsIdsOrFailHttp(
      Types.ObjectId.createFromHexString(chatId),
    );

    const companion =
      chat.firstCompanion._id === user._id
        ? chat.secondCompanion
        : chat.firstCompanion;

    if (companion.blockStatus !== 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES') {
      const socketsOfCompanion = this.connectedSockets[companion._id];

      if (!socketsOfCompanion) {
        return;
      }

      socketsOfCompanion.forEach(socket => {
        socket.emit('writing', {
          chatId,
        });
      });
    }
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
    this.throwIfAdmin(socket);

    const user = socket.request.user as UserDocument;

    await this.messagesService.sendMessage({
      ...createMessageData,
      chatId: Types.ObjectId.createFromHexString(createMessageData.chatId),
      userId: user._id,
    });
  }

  @SubscribeMessage('mark_message_as_read')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async markMessageAsRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() params: MarkMessageAsReadThroughWebSocketDto,
  ): Promise<void> {
    this.throwIfAdmin(socket);

    const user = socket.request.user as UserDocument;

    const {
      chat,
    } = await this.messagesService.markMessageAsReadConsideringAccessRights(
      user._id,
      params,
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
      socket.emit('message_read', {
        chatId: params.chatId,
        messageId: params.messageId,
      });
    });
  }

  private throwIfAdmin(socket: Socket): void {
    if (socket.request.user instanceof Admin) {
      throw new UnauthorizedException('Admins are not allowed');
    }
  }

  private doesClientTryingToAuthenticateAsAdmin(socket: Socket): boolean {
    return (
      !!socket.handshake.query.username && !!socket.handshake.query.password
    );
  }

  private async authExternalUser(socket: Socket): Promise<void> {
    try {
      const admin = await this.externalServiceBasicStrategy.validate(
        socket.handshake.query.username,
        socket.handshake.query.password,
      );

      socket.request.user = admin;
    } catch (err) {
      this.logger.error('Failed to authenticate socket connection of admin');
      throw err;
    }
  }

  private async authSocket(socket: Socket): Promise<void> {
    const payload = await this.jwtService.verifyAsync(
      socket.handshake.query.token,
    );
    const user = await this.usersService.getUserByIdOrFail(payload.sub);

    socket.request.user = user;
  }
}
