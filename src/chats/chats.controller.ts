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
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatsQueryDto } from './dto/chats-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatPathDto } from './dto/chat-path.dto';
import { Types } from 'mongoose';
import { PersonalChatDto } from './dto/personal-chat.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { CreatePersonalChatDto } from './dto/create-personal-chat.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createValidationPipe } from '../common/utils/create-validation-pipe.util';

@Controller()
@ApiTags('Chat')
@UsePipes(createValidationPipe())
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('user/personal-chats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async createPersonalChat(
    @Body() createData: CreatePersonalChatDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<PersonalChatDto> {
    return this.chatsService.createPersonalChat(currentUser._id, createData);
  }

  @Get('user/personal-chats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Object, isArray: true })
  async getPersonalChats(
    @Query() query: ChatsQueryDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<PersonalChatDto[]> {
    return this.chatsService.listPersonalChatsOfUser(currentUser, query);
  }

  @Get('user/personal-chats/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getPersonalChat(
    @Param() { chatId }: ChatPathDto,
    @CurrentUser() currentUser: UserDocument,
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
    @Param() { chatId }: ChatPathDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<PersonalChatDto> {
    return this.chatsService.readPersonalChatAsUser(
      new Types.ObjectId(chatId),
      currentUser._id,
    );
  }
}
