import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DMChannel, FriendShip, FriendShipStatus, User } from '@prisma/client';
import { read } from 'fs';
import Jwt2FAGuard from 'src/auth/guards/jwt-2fa.guard';
import { DmService } from 'src/prisma/dm/dm.service';
import { FriendsService } from 'src/prisma/friends/friends.service';
import { UserService } from 'src/prisma/user/user.service';
import { ChannelsGateway } from '../channels.gateway';

@Controller('dm')
@UseGuards(Jwt2FAGuard)
@ApiTags('Messages Prives')
@ApiSecurity('access-token')
export class ChannelPrivateController {
  constructor(
    private readonly dmChannelService: DmService,
    private readonly userService: UserService,
    private readonly friendService: FriendsService,
    private readonly gateway: ChannelsGateway,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: "Recuperer les messages prives d'un utilisateur",
  })
  @ApiOkResponse({
    description: "Tous les DMs de l'utilisateur",
  })
  async getAllMessages(@Req() req): Promise<DMChannel[]> {
    return await this.dmChannelService.get(req.user);
  }

  @Post('/:id')
  @ApiOperation({
    summary: "Creer un channel prive avec l'utilisateur specifie",
    description: "L'utilisateur doit etre ami avec l'utilisateur specifie",
  })
  @ApiNotFoundResponse({
    description: "L'utilisateur specifie n'existe pas.",
  })
  @ApiForbiddenResponse({
    description: 'Les utilisateurs ne sont pas amis',
  })
  @ApiBadRequestResponse({
    description: "L'utilisateur essaye de creer un channel avec lui meme",
  })
  async createChannel(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DMChannel> {
    if (id == req.user.id)
      throw new BadRequestException('Specified user is the connected user');

    // Retrieve target user
    const target: User | null = await this.userService.user({ id });
    if (!target) throw new NotFoundException('Specified user does not exist');

    // Check Friendship status
    const friends: { status: FriendShipStatus; requester: User } | null =
      await this.friendService.friendsWith(req.user, target);
    if (!friends || friends.status != FriendShipStatus.ACCEPTED)
      throw new ForbiddenException('Users are not friends');

    const channel: DMChannel | null = await this.dmChannelService.channel({
      DMChannelUser: {
        every: {
          OR: [{ user: req.user }, { user: target }],
        },
      },
    });
    if (channel) return channel;

    await this.gateway.userJoinChannel();

    return await this.dmChannelService.create(req.user, target);
  }
}
