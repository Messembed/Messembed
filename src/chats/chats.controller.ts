import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatsQueryDto } from './dto/chats-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatPathForMongoDto } from './dto/chat-path-for-mongo.dto';
import { Types } from 'mongoose';
import { PersonalChatDto } from './dto/personal-chat-from-mongo.dto';
import { UserMongoDocument } from '../users/schemas/user.schema';
import { CreatePersonalChatDto } from './dto/create-personal-chat.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@ApiTags('Chat')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('user/personal-chats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async createPersonalChat(
    @Body() createData: CreatePersonalChatDto,
    @CurrentUser() currentUser: UserMongoDocument,
  ): Promise<PersonalChatDto> {
    return this.chatsService.createPersonalChat(currentUser._id, createData);
  }

  @Get('user/personal-chats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Object, isArray: true })
  async getPersonalChats(
    @Query() query: ChatsQueryDto,
    @CurrentUser() currentUser: UserMongoDocument,
  ): Promise<PersonalChatDto[]> {
    return this.chatsService.listPersonalChatsOfUser(currentUser._id, query);
  }

  @Get('user/personal-chats/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getPersonalChat(
    @Param() { chatId }: ChatPathForMongoDto,
    @CurrentUser() currentUser: UserMongoDocument,
  ): Promise<PersonalChatDto> {
    return this.chatsService.getPersonalChatOfUserOrFailHttp(
      currentUser._id,
      new Types.ObjectId(chatId),
    );
  }

  @Post('user/personal-chats/:chatId/read-status')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Object })
  @UseInterceptors(ClassSerializerInterceptor)
  async setRead(
    @Param() { chatId }: ChatPathForMongoDto,
    @CurrentUser() currentUser: UserMongoDocument,
  ): Promise<PersonalChatDto> {
    return this.chatsService.readPersonalChatAsUser(
      new Types.ObjectId(chatId),
      currentUser._id,
    );
  }
}
