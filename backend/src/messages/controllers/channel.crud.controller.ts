import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import Jwt2FAGuard from 'src/auth/guards/jwt-2fa.guard';
import { ChannelsService } from 'src/prisma/channels/channels.service';
import { ChannelPasswordInterceptor } from '../interceptors/channelPassword.interceptor';
import { ChannelDTO } from '../dto/channel.dto';
import { ChannelsGateway } from '../channels.gateway';
import { ChannelUserStatus } from '@prisma/client';

@Controller('channels')
@UseGuards(Jwt2FAGuard)
@ApiTags('Messages')
@ApiSecurity('access-token')
export class ChannelCrudController {
  constructor(
    private readonly channelService: ChannelsService,
    private readonly channelGateway: ChannelsGateway,
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
    const chann = await this.channelService.create(
      channel.name,
      channel.type,
      channel.password,
      req.user,
    );

    await this.channelGateway.userJoinChannel(chann, req.user);

    return {
      id: chann.id,
      type: chann.type,
      name: chann.name,
    };
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Recuperer les informations publique de la Room',
  })
  async getChannelInformation(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    const channel = await this.channelService.channel(id);
    if (!channel) throw new NotFoundException('Channel not found');

    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      users_count: channel.users.length,
    };
  }

  @Get('/:id/messages')
  @ApiOperation({
    summary: 'Récupérer un channel avec ses messages, ses utilisateurs',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID du channel à récupérer',
  })
  @ApiQuery({
    name: 'start',
    description: 'Message à partir duquel il faut commencer la sélection',
    type: 'integer',
    required: false,
  })
  @ApiQuery({
    name: 'count',
    description: "Nombre de messages qu'il faut prendre",
    type: 'integer',
    required: false,
  })
  async getChannel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query('start', new DefaultValuePipe(0), ParseIntPipe) start: number,
    @Query('count', new DefaultValuePipe(1), ParseIntPipe) count: number,
  ) {
    if (count < 1 || count > 100) throw new BadRequestException();
    if (start < 0 || start > 100) throw new BadRequestException();

    if (!(await this.channelService.isUserInChannel(id, req.user)))
      throw new UnauthorizedException('User not in channel');

    const channel = await this.channelService.channel(id, start, count);
    if (!channel) throw new NotFoundException('Channel not found');

    return channel;
  }

  @Put('/:id')
  @ApiOperation({
    summary: "Modifier le channel. L'utilisateur doit etre admin.",
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID du channel à récupérer',
  })
  @ApiOkResponse({
    description: 'Channel modifie',
  })
  @ApiForbiddenResponse({
    description: "L'utilisateur doit être admin du channel",
  })
  @ApiNotFoundResponse({
    description: 'Channel inexistant',
  })
  async updateChannel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() form: ChannelDTO,
  ) {
    const channel = await this.channelService.channelUser(id, req.user);
    if (!channel) throw new NotFoundException('Channel not found');
    if (channel.users.length != 1)
      throw new NotFoundException('User not in channel');

    const user = channel.users[0];
    if (user.state != ChannelUserStatus.ADMIN)
      throw new ForbiddenException('User not admin');

    channel.name = form.name;
    channel.type = form.type;

    // await this.channelGateway.deleteChannel(channel);
    await this.channelService.update(channel, form.password);
    return 'ok';
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Supprimer un canal',
    description:
      "L'utilisateur supprimant le canal doit être le owner du canal.",
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID du channel à rejoindre',
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

    await this.channelGateway.deleteChannel(channel);
    await this.channelService.delete(channel);
    return 'ok';
  }
}
