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
import { Status, User } from '@prisma/client';
import { FriendsService } from 'src/prisma/friends/friends.service';
import { ParseEnumPipe } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'friends',
  cors: {
    origin: true,
  },
})
export class StatusGateway implements NestGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly friendsService: FriendsService,
  ) {}

  @WebSocketServer()
  server: Server;

  async afterInit(server) {
    const middle = WSAuthMiddleware(
      this.jwtService,
      this.userService,
      this.configService,
    );
    server.use(middle);
    await this.userService.setAllUsersOffline();
  }

  async handleConnection(client: AuthSocket) {
    client.data.user = client.user;

    const friends = await this.friendsService.friends(client.user);
    friends.forEach((element) => {
      if (element.receiver.id != client.user.id) {
        client.join('' + element.receiver.id);
      } else {
        client.join('' + element.requester.id);
      }
    });

    await this.userService.updateStatus(client.user, Status.ONLINE);
    this.server
      .to('' + client.user.id)
      .emit('status', client.user.id, Status.ONLINE);
  }

  async handleDisconnect(client: AuthSocket) {
    await this.userService.updateStatus(client.user, Status.OFFLINE);

    this.server
      .to('' + client.user.id)
      .emit('status', client.user.id, Status.OFFLINE);

    const friends = await this.friendsService.relations(client.user);
    friends.forEach((element) => {
      if (element.receiver.id != client.user.id)
        client.leave('' + element.receiver.name);
      else client.leave('' + element.requester.name);
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
      .to('' + client.user.id)
      .emit('status', client.user.id, data);
  }

  async newFriend(user1: User, user2: User) {
    const sockets = await this.server.fetchSockets();

    const addUser = async (u1, u2) => {
      sockets
        .filter((u) => u.data.user.id == u1.id)
        .forEach(async (socket) => {
          await socket.join('' + u2.id);
          await socket.emit('new', {
            id: u2.id,
            name: u2.name,
            avatar: u2.avatar,
            status: u2.status,
          });
        });
    };

    await addUser(user1, user2);
    await addUser(user2, user1);
  }

  async deleteFriend(user1: User, user2: User) {
    const sockets = await this.server.fetchSockets();

    const deleteUser = async (u1, u2) => {
      sockets
        .filter((u) => u.data.user.id == u1.id)
        .forEach(async (socket) => {
          await socket.leave('' + u2.id);
          await socket.emit('delete', {
            id: u2.id,
          });
        });
    };

    await deleteUser(user1, user2);
    await deleteUser(user2, user1);
  }
}
