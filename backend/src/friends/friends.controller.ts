import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FriendShipStatus } from '@prisma/client';
import Jwt2FAGuard from 'src/auth/guards/jwt-2fa.guard';
import { FriendsService } from 'src/prisma/friends/friends.service';
import { UserService } from 'src/prisma/user/user.service';
import { StatusGateway } from './status.gateway';

@Controller('friends')
@ApiSecurity('access-token')
@ApiTags('Amis')
export class FriendsController {
  constructor(
    private readonly friends: FriendsService,
    private readonly users: UserService,
    private readonly gateway: StatusGateway,
  ) {}

  @Get()
  @UseGuards(Jwt2FAGuard)
  @ApiOperation({
    summary:
      "Récupérer la liste des demandes, bloquages et des amis de l'utilisateur",
  })
  @ApiOkResponse({
    description: "Contient la liste d'ami de l'utilisateur",
  })
  async getFriends(@Req() req) {
    return this.friends.relations(req.user);
  }

  @Get('/:id')
  @UseGuards(Jwt2FAGuard)
  @ApiOperation({ summary: 'Récupérer le lien avec un autre utilisateur' })
  @ApiOkResponse({
    description: "Contient la relation avec l'utilisateur spécifié",
    content: {
      'application/json': {
        schema: {
          type: 'string',
          enum: Object.values(FriendShipStatus),
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "L'utilisateur a demandé la relation avec son profile...",
  })
  @ApiNotFoundResponse({
    description:
      'Utilisateur spécifié introuvable ou aucune relation existante ',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: "ID de l'utilisateur à chercher",
  })
  async getFriend(@Req() req, @Param('id', ParseIntPipe) id: number) {
    if (id == req.user.id)
      throw new BadRequestException(
        'Vous ne pouvez pas être amis avec vous même...',
      );
    const user = await this.users.user({ id: id });
    if (!user) throw new NotFoundException("L'utilisateur n'existe pas");
    const status = await this.friends.relationWith(req.user, user);
    if (!status) throw new NotFoundException('Aucun lien avec cet utilisateur');
    return status.status;
  }

  @Post('/:id')
  @UseGuards(Jwt2FAGuard)
  @ApiOperation({ summary: 'Ajouter un ami' })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: "ID de l'utilisateur cible",
  })
  @ApiCreatedResponse({ description: "Une demande d'ami a été envoyé" })
  @ApiBadRequestResponse({
    description: "L'utilisateur essaye de s'envoyer une auto demande",
  })
  @ApiNotFoundResponse({ description: "L'utilisateur spécifié n'existe pas" })
  @ApiForbiddenResponse({
    description: 'Les deux utilisateurs ont déjà un lien',
  })
  async requestFriend(@Req() req, @Param('id', ParseIntPipe) id: number) {
    if (id == req.user.id)
      throw new HttpException(
        'Vous ne pouvez pas être amis avec vous même...',
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.users.user({ id: id });
    if (!user)
      throw new HttpException(
        "L'utilisateur n'existe pas",
        HttpStatus.NOT_FOUND,
      );

    const is_friend = await this.friends.relationWith(req.user, user);
    if (is_friend)
      throw new HttpException(
        'Ces deux utilisateurs ont déjà un lien',
        HttpStatus.FORBIDDEN,
      );

    await this.friends.createFriendShip(req.user, user);
  }

  @Delete('/:id/block')
  @UseGuards(Jwt2FAGuard)
  @ApiOperation({ summary: 'Bloquer un utilisateur' })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: "ID de l'utilisateur cible",
  })
  @ApiOkResponse({
    description: "L'utilisateur a été bloqué",
  })
  @ApiNotFoundResponse({ description: "L'utilisateur spécifié n'existe pas" })
  @ApiBadRequestResponse({
    description: "L'utilisateur a déjà un lien existant avec la personne",
  })
  async blockUser(@Req() req, @Param('id', ParseIntPipe) id: number) {
    if (id == req.user.id)
      throw new HttpException(
        'Vous ne pouvez pas vous bloquer vous même...',
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.users.user({ id: id });
    if (!user)
      throw new HttpException(
        "L'utilisateur n'existe pas",
        HttpStatus.NOT_FOUND,
      );

    const is_friend = await this.friends.relationWith(req.user, user);
    if (
      !is_friend ||
      (is_friend.status == FriendShipStatus.BLOCKED &&
        is_friend.requester.id != req.user.id)
    ) {
      await this.friends.createFriendShip(
        req.user,
        user,
        FriendShipStatus.BLOCKED,
      );
      await this.gateway.deleteFriend(req.user, user);
      return;
    }
    if (is_friend)
      throw new HttpException(
        'Vous avez une relation existante avec la personne...',
        HttpStatus.BAD_REQUEST,
      );
    throw new HttpException(
      "Vous avez déjà bloqué l'autre utilisateur",
      HttpStatus.BAD_REQUEST,
    );
  }

  @Delete('/:id')
  @UseGuards(Jwt2FAGuard)
  @ApiOperation({ summary: 'Supprimer un lien avec une personne' })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: "ID de l'utilisateur cible",
  })
  @ApiOkResponse({
    description:
      "L'utilisateur a été supprimé de la liste d'ami de l'utilisateur",
  })
  @ApiNotFoundResponse({ description: "L'utilisateur spécifié n'existe pas" })
  @ApiBadRequestResponse({
    description: "L'utilisateur n'a aucun lien avec la personne ciblée",
  })
  async removeFriend(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const user = await this.users.user({ id: id });
    if (!user)
      throw new HttpException(
        "L'utilisateur n'existe pas",
        HttpStatus.NOT_FOUND,
      );

    const is_friend = await this.friends.relationWith(req.user, user);
    if (!is_friend)
      throw new HttpException(
        "Vous n'avez aucune liaison avec l'autre utilisateur.",
        HttpStatus.BAD_REQUEST,
      );

    switch (is_friend.status) {
      case FriendShipStatus.ACCEPTED:
        this.friends.deleteFriendShip(req.user, user);
        return;

      case FriendShipStatus.BLOCKED:
        if (is_friend.requester.id == req.user.id) {
          this.friends.deleteSpecificFriendShip(req.user, user);
          return;
        }
        throw new HttpException(
          "Vous n'avez aucune liaison avec cette personne.",
          HttpStatus.BAD_REQUEST,
        );

      case FriendShipStatus.WAITING:
        this.friends.deleteFriendShip(req.user, user);
        await this.gateway.deleteFriend(req.user, user);
        return;

      default:
        throw new HttpException(
          'Une amitié particulière...',
          HttpStatus.NOT_FOUND,
        );
    }
  }

  @Post('/:id/accept')
  @UseGuards(Jwt2FAGuard)
  @ApiOperation({ summary: "Accepter une demande d'ami d'un utilisateur" })
  @ApiCreatedResponse({
    description: 'La demande a bien été acceptée',
  })
  @ApiBadRequestResponse({
    description: "L'utilisateur a demandé la relation avec son profile...",
  })
  @ApiNotFoundResponse({ description: 'Utilisateur spécifié introuvable' })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: "ID de l'utilisateur à chercher",
  })
  async acceptFriend(@Req() req, @Param('id', ParseIntPipe) id: number) {
    if (id == req.user.id)
      throw new HttpException(
        'Vous ne pouvez pas être amis avec vous même...',
        HttpStatus.BAD_REQUEST,
      );
    const user = await this.users.user({ id: id });
    if (!user)
      throw new HttpException(
        "L'utilisateur n'existe pas",
        HttpStatus.NOT_FOUND,
      );
    const relation = await this.friends.relationWith(req.user, user);
    if (
      relation.status == FriendShipStatus.WAITING &&
      relation.requester != req.user
    ) {
      await this.friends.acceptFriendShip(req.user, user);
      await this.gateway.newFriend(req.user, user);
      return;
    }

    throw new HttpException(
      "Aucune demande d'ami par cet utilisateur",
      HttpStatus.BAD_REQUEST,
    );
  }
}
