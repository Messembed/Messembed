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
import { ChatPathForMongoDto } from '../chats/dto/chat-path-for-mongo.dto';
import { CreateMessageInMongoDto } from './dto/create-message-in-mongo.dto';
import { Types } from 'mongoose';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserMongoDocument } from '../users/schemas/user.schema';

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
    @Param() { chatId }: ChatPathForMongoDto,
    @Body() createDto: CreateMessageInMongoDto,
    @CurrentUser() currentUser: UserMongoDocument,
  ): Promise<any> {
    return (
      await this.messagesService.createMessage({
        ...createDto,
        chatId: new Types.ObjectId(chatId),
        userId: currentUser._id,
      })
    ).toJSON();
  }

  /**
   * @todo we need to remove external service auth strategy, as we have special MessagesAdminController
   */
  @Get('chats/:chatId/messages')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @ApiOkResponse({ type: () => Object, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathForMongoDto,
    @Query() filters: GetMessagesFromMongoFiltersDto,
    @CurrentUser() currentUser: UserMongoDocument,
  ): Promise<PaginatedMessagesFromMongoDto> {
    return this.messagesService.getPaginatedMessagesForUser(
      currentUser._id,
      Types.ObjectId(chatId),
      filters,
    );
  }
}
