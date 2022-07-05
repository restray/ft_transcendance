import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import Jwt2FAGuard from 'src/auth/guards/jwt-2fa.guard';
import { ChannelsService } from 'src/prisma/channels/channels.service';
import { ChannelPasswordInterceptor } from '../interceptors/channelPassword.interceptor';
import { ChannelDTO } from '../dto/channel.dto';
import { MessagesService } from '../messages.service';

@Controller('channels')
@UseGuards(Jwt2FAGuard)
@ApiTags('Messages')
@ApiSecurity('access-token')
export class ChannelCrudController {
  constructor(
    private readonly channelService: ChannelsService,
    private readonly messageService: MessagesService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: "Récupérer tous les channels dont l'utilisateur fait parti",
  })
  @ApiOkResponse({
    description: 'Liste de tous les channels dont il fait parti',
  })
  async channels(@Req() req) {
    return await this.channelService.channelsForUser(req.user);
  }

  @Post('/')
  @ApiOperation({
    summary: 'Créer un channel',
  })
  @UseInterceptors(ChannelPasswordInterceptor)
  async create(@Req() req, @Body() channel: ChannelDTO) {
    return await this.channelService.create(
      channel.name,
      channel.type,
      channel.password,
      req.user,
    );
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Supprimer un canal',
    description:
      "L'utilisateur supprimant le canal doit être le owner du canal.",
  })
  @ApiOkResponse({
    description: 'Channel supprimé',
  })
  @ApiForbiddenResponse({
    description: "L'utilisateur doit être le owner du channel",
  })
  @ApiNotFoundResponse({
    description: 'Channel inexistant',
  })
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const channel = await this.channelService.channel(id);
    if (!channel) throw new NotFoundException('Channel not found');

    // Only owner can delete channel
    if (req.user.id != channel.ownerId) throw new ForbiddenException();

    await this.channelService.delete(channel);
    return 'ok';
  }
}
