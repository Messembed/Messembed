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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Chat } from './entities/Chat.entity';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/CreateChat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatPathDto } from './dto/ChatPath.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';
import { PersonalChatDto } from './dto/PersonalChat.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/ExternalServiceAuthGuard.guard';
import { AuthData } from '../auth/decorators/AuthData.decorator';
import { RequestAuthData } from '../auth/classes/RequestAuthData.class';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Chat')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
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
  @UseGuards(ExternalServiceAuthGuard)
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

  @Get('user/personal-chats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto, isArray: true })
  async getPersonalChats(
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatDto[]> {
    return this.chatsService.getPersonalChatsOfUser(authData.user.id);
  }

  @Get('user/personal-chats/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async getPersonalChat(
    @Param() { chatId }: ChatPathDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatDto> {
    return this.chatsService.getPersonalChatOfUserOrFailHttp(
      authData.user.id,
      chatId,
    );
  }

  @Post('user/personal-chats/:chatId/read-status')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async setRead(
    @Param() { chatId }: ChatPathDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatDto> {
    return this.chatsService.readPersonalChatAsUser(chatId, authData.user.id);
  }
}
