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
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatPathForMongoDto } from '../chats/dto/chat-path-for-mongo.dto';
import { CreateMessageInMongoDto } from './dto/create-message-in-mongo.dto';
import { Types } from 'mongoose';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';

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
  @UseGuards(UserAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createMessage(
    @Param() { chatId }: ChatPathForMongoDto,
    @Body() createDto: CreateMessageInMongoDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<any> {
    return (
      await this.messagesService.createMessageInMongo({
        ...createDto,
        chatId: new Types.ObjectId(chatId),
        userId: authData.user._id,
      })
    ).toJSON();
  }

  /**
   * @todo we need to remove external service auth strategy, as we have special MessagesAdminController
   */
  @Get('chats/:chatId/messages')
  @UseGuards(UserAuthGuard)
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
    @AuthData() authData: RequestAuthData,
  ): Promise<PaginatedMessagesFromMongoDto> {
    return this.messagesService.getPaginatedMessagesFromMongoConsideringAccessRights(
      authData,
      Types.ObjectId(chatId),
      filters,
    );
  }
}
