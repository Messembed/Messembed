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
import { Types } from 'mongoose';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { CreateMessageAsAdminInMongoDto } from './dto/create-message-as-admin-in-mongo.dto';

@Controller()
@ApiTags('Messages')
export class MessagesAdminController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('admin-api/chats/:chatId/messages')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @UseGuards(ExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createMessage(
    @Param() { chatId }: ChatPathForMongoDto,
    @Body() createDto: CreateMessageAsAdminInMongoDto,
  ): Promise<any> {
    return (
      await this.messagesService.createMessageInMongo({
        ...createDto,
        chatId: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(createDto.userId),
      })
    ).toJSON();
  }

  @Get('admin-api/chats/:chatId/messages')
  @UseGuards(ExternalServiceAuthGuard)
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
