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
import { ChatPathDto } from './dto/chat-path.dto';
import { PaginatedChatsDto } from './dto/paginated-chats.dto';
import { Types } from 'mongoose';
import { GetChatPathDto } from './dto/get-chat-path.dto';

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
    return (await this.chatsService.createChat(createDto)).toJSON();
  }

  @Patch('admin-api/chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async editChat(
    @Param() { chatId }: ChatPathDto,
    @Body() editDto: EditChatDto,
  ): Promise<any> {
    return (
      await this.chatsService.editChat(new Types.ObjectId(chatId), editDto)
    ).toJSON();
  }

  @Get('admin-api/chats/:chatIdOrCompanionsIds')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getChat(
    @Param() { chatIdOrCompanionsIds }: GetChatPathDto,
  ): Promise<any> {
    return (
      await this.chatsService.getChatByIdOrCompanionsIdsOrFailHttp(
        chatIdOrCompanionsIds,
      )
    ).toJSON();
  }

  @Get('admin-api/chats')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedChatsDto })
  async getAllChats(): Promise<PaginatedChatsDto> {
    return this.chatsService.listAllChats();
  }
}
