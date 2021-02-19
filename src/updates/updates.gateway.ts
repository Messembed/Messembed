import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { UpdateDocument } from './schemas/update.schema';
import { UpdateDto } from './dto/update.dto';
import { MessagesService } from '../messages/messages.service';

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

  @SubscribeMessage('events')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async sendNewMessage(
    @MessageBody() createMessageData: CreateMessageInMongoDto,
  ) {}

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
