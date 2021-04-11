import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatPathDto } from '../chats/dto/chat-path.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Types } from 'mongoose';
import { GetMessagesFiltersDto } from './dto/get-messages-filters.dto';
import { PaginatedMessagesDto } from './dto/paginated-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { MessageForFrontend } from './dto/message-for-frontend.dto';

@Controller()
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * @todo we need to remove external service auth strategy, as we have special MessagesAdminController
   */
  @Post('chats/:chatId/messages')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createMessage(
    @Param() { chatId }: ChatPathDto,
    @Body() createDto: CreateMessageDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<any> {
    return (
      await this.messagesService.sendMessage({
        ...createDto,
        chatId: new Types.ObjectId(chatId),
        userId: currentUser._id,
      })
    ).toJSON();
  }

  @Get('chats/:chatId/messages')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @ApiOkResponse({ type: () => PaginatedMessagesDto, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathDto,
    @Query() filters: GetMessagesFiltersDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<PaginatedMessagesDto> {
    return this.messagesService.getPaginatedMessagesForUser(
      currentUser,
      Types.ObjectId(chatId),
      filters,
    );
  }

  @Get('chats/:chatId/messages-with-attachments')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @ApiOkResponse({ type: () => MessageForFrontend, isArray: true })
  async getAttachments(
    @Param() { chatId }: ChatPathDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<MessageForFrontend[]> {
    return this.messagesService.listMessagesWithAttachments(
      currentUser,
      Types.ObjectId(chatId),
    );
  }
}
