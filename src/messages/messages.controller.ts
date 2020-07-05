import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { Message } from './entities/Message.entity';
import { MessagesService } from './messages.service';
import { ChatPathDto } from '../chats/dto/ChatPath.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetMessagesFiltersDto } from './dto/GetMessagesFilters.dto';
import { PaginatedMessagesDto } from './dto/PaginatedMessages.dto';
import { JwtOrExternalServiceAuthGuard } from '../auth/guards/JwtOrExternalServiceAuthGuard.guard';
import { AuthData } from '../auth/decorators/AuthData.decorator';
import { RequestAuthData } from '../auth/classes/RequestAuthData.class';
import { ExtendedValidationPipe } from '../common/pipes/extended-validation.pipe';
import { ValidationGroup } from '../common/constants/validation-group.enum';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('chats/:chatId/messages')
  @UsePipes(
    ExtendedValidationPipe(
      {
        whitelist: true,
        transform: true,
      },
      req => [
        ValidationGroup.ALL,
        req.user.isExternalService
          ? ValidationGroup.EXT_SER
          : ValidationGroup.USER,
      ],
    ),
  )
  @UseGuards(JwtOrExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Message })
  async createMessage(
    @Param() { chatId }: ChatPathDto,
    @Body() createDto: CreateMessageDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<Message> {
    return this.messagesService.createMessage({
      ...createDto,
      chatId,
      userId: createDto.userId ?? authData.user.id,
    });
  }

  @Get('chats/:chatId/messages')
  @UseGuards(JwtOrExternalServiceAuthGuard)
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
    @AuthData() authData: RequestAuthData,
  ): Promise<PaginatedMessagesDto> {
    return this.messagesService.getPaginatedMessagesConsideringAccessRights(
      authData,
      chatId,
      filters,
    );
  }
}
