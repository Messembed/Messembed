import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';
import { GetUpdatesRequestDto } from './dto/get-updates-request.dto';
import { UpdateDto } from './dto/update.dto';
import { UpdatesService } from './updates.service';

@Controller('updates')
@ApiTags('Updates')
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) {}

  @Get()
  @ApiOkResponse({
    type: () => UpdateDto,
  })
  @UseGuards(UserAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async getUpdates(
    @Query() filters: GetUpdatesRequestDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<UpdateDto[]> {
    const updates = await this.updatesService.getUpdatesForUser(
      authData.user._id,
      filters.creationDateOfLastFetchedUpdate,
    );

    return updates;
  }
}
