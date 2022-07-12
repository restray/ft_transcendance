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
import { AuthSocket, WSAuthMiddleware } from 'src/auth/websocket.middleware';
import { UserService } from 'src/prisma/user/user.service';
import { Status } from '@prisma/client';
import { FriendsService } from 'src/prisma/friends/friends.service';
import { ParseEnumPipe } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'friends',
  cors: {
    origin: true,
  },
})
export class FriendsGateway implements NestGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly friendsService: FriendsService,
  ) {}

  @WebSocketServer()
  server;

  afterInit(server) {
    const middle = WSAuthMiddleware(
      this.jwtService,
      this.userService,
      this.configService,
    );
    server.use(middle);
  }

  async handleConnection(client: AuthSocket) {
    const friends = await this.friendsService.friends(client.user);
    friends.forEach((element) => {
      if (element.receiver.id != client.user.id) {
        client.join(element.receiver.name);
      } else {
        client.join(element.requester.name);
      }
    });

    await this.userService.updateStatus(client.user, Status.ONLINE);
    this.server
      .to(client.user.name)
      .emit('status', client.user.name, Status.ONLINE);
  }

  async handleDisconnect(client: AuthSocket) {
    await this.userService.updateStatus(client.user, Status.OFFLINE);

    this.server
      .to(client.user.name)
      .emit('status', client.user.name, Status.OFFLINE);

    const friends = await this.friendsService.relations(client.user);
    friends.forEach((element) => {
      if (element.receiver.id != client.user.id)
        client.leave(element.receiver.name);
      else client.leave(element.requester.name);
    });
  }

  @SubscribeMessage('status')
  async changeStatus(
    @MessageBody(
      new ParseEnumPipe(Status, {
        exceptionFactory: (err) => new WsException(err),
      }),
    )
    data: Status,
    @ConnectedSocket() client: AuthSocket,
  ) {
    await this.server
      .to(client.user.name)
      .emit('status', client.user.name, data);
  }
}
