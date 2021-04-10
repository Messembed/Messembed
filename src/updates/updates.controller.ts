import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';
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
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async getUpdates(
    @Query() filters: GetUpdatesRequestDto,
    @CurrentUser() currentUser: UserDocument,
  ): Promise<UpdateDto[]> {
    const updates = await this.updatesService.getUpdatesForUser(
      currentUser._id,
      filters.creationDateOfLastFetchedUpdate,
    );

    return updates;
  }
}
