import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { EditChatDto } from './dto/edit-chat.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { ChatPathForMongoDto } from './dto/chat-path-for-mongo.dto';
import { PaginatedChatsInMongoDto } from './dto/paginated-chats-from-mongo.dto';
import { Types } from 'mongoose';

@Controller()
@ApiTags('Chat')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class ChatsAdminController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('admin-api/chats')
  @ApiCreatedResponse({ type: () => Object })
  @UseGuards(ExternalServiceAuthGuard)
  async createChat(@Body() createDto: CreateChatDto): Promise<any> {
    return (await this.chatsService.createChatInMongo(createDto)).toJSON();
  }

  @Patch('admin-api/chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async editChat(
    @Param() { chatId }: ChatPathForMongoDto,
    @Body() editDto: EditChatDto,
  ): Promise<any> {
    return (
      await this.chatsService.editChatInMongo(
        new Types.ObjectId(chatId),
        editDto,
      )
    ).toJSON();
  }

  @Get('admin-api/chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getChat(@Param() { chatId }: ChatPathForMongoDto): Promise<any> {
    return (
      await this.chatsService.getChatFromMongoOrFailHttp(
        new Types.ObjectId(chatId),
      )
    ).toJSON();
  }

  @Get('admin-api/chats')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getAllChats(): Promise<PaginatedChatsInMongoDto> {
    return this.chatsService.getAllChatsFromMongo();
  }
}
