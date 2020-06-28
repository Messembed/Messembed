import {
  Controller,
  Body,
  Post,
  Put,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { Chat } from './entities/Chat.entity';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/CreateChat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatPathDto } from './dto/ChatPath.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';
import { PersonalChatDto } from './dto/PersonalChat.dto';
import { UserPathDto } from '../users/dto/UserPath.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/ExternalServiceAuthGuard.guard';
import { JwtOrExternalServiceAuthGuard } from '../auth/guards/JwtOrExternalServiceAuthGuard.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Chat')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('chats')
  @ApiCreatedResponse({ type: () => Chat })
  @UseGuards(ExternalServiceAuthGuard)
  async createChat(@Body() createDto: CreateChatDto): Promise<Chat> {
    return this.chatsService.createChat(createDto);
  }

  @Put('chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Chat })
  async editChat(
    @Param() { chatId }: ChatPathDto,
    @Body() editDto: EditChatDto,
  ): Promise<Chat> {
    return this.chatsService.editChat(chatId, editDto);
  }

  @Get('chats/:chatId')
  @UseGuards(JwtOrExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Chat })
  async getChat(@Param() { chatId }: ChatPathDto): Promise<Chat> {
    return this.chatsService.getChat(chatId);
  }

  @Get('chats')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedChatsDto })
  async getAllChats(): Promise<PaginatedChatsDto> {
    return this.chatsService.getAllChats();
  }

  @Get('users/:userId/personalChats')
  @UseGuards(JwtOrExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto, isArray: true })
  async getPersonalChats(
    @Param() { userId }: UserPathDto,
  ): Promise<PersonalChatDto[]> {
    return this.chatsService.getPersonalChats(userId);
  }
}
