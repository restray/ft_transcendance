import { ParseBoolPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { User } from '@prisma/client';
import { Server } from 'socket.io';
import { AuthSocket, WSAuthMiddleware } from 'src/auth/websocket.middleware';
import { UserService } from 'src/prisma/user/user.service';
import { GameRoom } from './game.interface';

/**
 * Represents the game websocket gateway.
 *
 * @namespace games
 * @event connection(in) When an user try to connect to the server. Can fail if the user has another client logged somewhere else.
 * @event disconnect(in) When an user is disconnecting from the server.
 * @event move(in)       When an user is moving his racket. Can fail if user is too high or low.
 * @event move(out)      A broadcast when any user move
 * @event tick(out)      Send game informations (status, scores, time_spent, ball[position, vector, speed], players[2][position]) to all users in a room
 * @event score(out)     When a user score a point
 * @event start(out)     When a ball is launch
 * @class GameGateway
 */
@WebSocketGateway({
  namespace: 'games',
  cors: {
    origin: true,
  },
})
export class GameGateway implements NestGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  games: Array<GameRoom>;
  connectedUsers: Array<number>;

  afterInit(server) {
    this.games = [];
    this.connectedUsers = [];

    const middle = WSAuthMiddleware(
      this.jwtService,
      this.userService,
      this.configService,
    );
    server.use(middle);
  }

  isUserAlreadyConnected(user: User) {
    const connectedUser = this.connectedUsers.filter((u) => u == user.id);
    return connectedUser.length > 0;
  }

  async handleConnection(client: AuthSocket) {
    client.data.user = client.user;

    // We only allow one client per user to play/watch a game
    if (this.isUserAlreadyConnected(client.user)) {
      client.disconnect();
      return;
      // throw new WsException('Already logged in on another client');
    }

    this.connectedUsers.push(client.user.id);

    // We inform the game room that the client connect
    const userGame = this.games.filter((g) => !g.isUserInMatch(client.user));
    if (userGame.length == 1) userGame[0].userConnect(client);
  }

  handleDisconnect(client: AuthSocket) {
    let indexUser = 0;
    while (indexUser > -1) {
      indexUser = this.connectedUsers.indexOf(client.data.user.id);
      if (indexUser > -1) this.connectedUsers.splice(indexUser);
    }

    // We inform the game room that the client disconnect
    const userGame = this.games.filter((g) => g.isUserInMatch(client.user));
    if (userGame.length == 1) userGame[0].userDisconnect(client);
  }

  @SubscribeMessage('new')
  newGame(
    @MessageBody('match_making', ParseBoolPipe) isMatchMakingEnabled = true,
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (isMatchMakingEnabled) {
      const joinableGames = this.games.filter((game, index, games) =>
        games[index].canPlayerJoin(client.user),
      );
      if (joinableGames.length > 0) {
        return joinableGames[0].userConnect(client);
      }
    }

    const client_game = new GameRoom(
      !isMatchMakingEnabled,
      this.server,
      client.user,
    );
    this.games.push(client_game);
    return client_game.getGame();
  }

  @SubscribeMessage('join')
  joinGame(
    @MessageBody('room') roomId: string,
    @ConnectedSocket() client: AuthSocket,
  ) {
    let game: GameRoom[] | GameRoom = this.games.filter((g) => g.id == roomId);
    if (game.length <= 0) throw new WsException('No game found with this id.');

    game = game[0];
    return game.userConnect(client);
  }
}
