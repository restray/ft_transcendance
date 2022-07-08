import { ParseIntPipe } from '@nestjs/common';
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
import { ChannelsService } from 'src/prisma/channels/channels.service';
import {
  localUploadToURL,
  UserRequest,
  UserService,
} from 'src/prisma/user/user.service';
import { Server } from 'socket.io';
import { Channel, ChannelUserStatus } from '@prisma/client';

@WebSocketGateway({
  namespace: 'channels',
  cors: {
    origin: true,
  },
})
export class ChannelsGateway implements NestGateway {
  constructor(
    private readonly channelService: ChannelsService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  private server: Server;

  afterInit(server) {
    const middle = WSAuthMiddleware(
      this.jwtService,
      this.userService,
      this.configService,
    );
    server.use(middle);
  }

  async handleConnection(client: AuthSocket) {
    const channels = await this.channelService.channelsForUser(client.user);
    client.data.user = client.user;
    channels.forEach((channel) => {
      client.join(`channel-${channel.id}`);
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody('channel', ParseIntPipe) channel_id: number,
    @MessageBody('message') message: string,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    if (message.length <= 0 || message.length > 2500)
      throw new WsException('Message too long');

    const isUserInChannel = await this.channelService.isUserInChannel(
      channel_id,
      socket.user,
    );
    if (isUserInChannel === false) throw new WsException('User not in channel');
    if (isUserInChannel.muted) throw new WsException('User muted');

    await this.channelService.addMessage(channel_id, socket.user, message);

    socket.broadcast.to(`channel-${channel_id}`).emit('message', {
      channel: channel_id,
      message,
      user: {
        id: socket.user.id,
        name: socket.user.name,
        avatar: localUploadToURL(socket.user.avatar),
      },
    });

    return 'ok';
  }

  async userJoinChannel(channel: Channel, user: UserRequest) {
    const connectedUsers = await this.server.fetchSockets();

    connectedUsers.forEach((connectedUser) => {
      if (connectedUser.data.user.id == user.id) {
        connectedUser.join(`channel-${channel.id}`);
      }
    });

    await this.server.to(`channel-${channel.id}`).emit('join', {
      channel: channel.id,
      user: {
        id: user.id,
        name: user.name,
        avatar: localUploadToURL(user.avatar),
      },
    });
  }

  async actionOnChannel(
    channel: Channel,
    action: { role: ChannelUserStatus; user?: UserRequest },
  ) {
    await this.server.to(`channel-${channel.id}`).emit('action', {
      channel: channel.id,
      role: action.role,
      user: {
        id: action.user.id,
        name: action.user.name,
        avatar: localUploadToURL(action.user.avatar),
      },
    });
  }

  async userLeftChannel(channel: Channel, user: UserRequest) {
    const roomUsers = await this.server
      .in(`channel-${channel.id}`)
      .fetchSockets();

    await this.server.to(`channel-${channel.id}`).emit('leave', {
      channel: channel.id,
      user: {
        id: user.id,
        name: user.name,
        avatar: localUploadToURL(user.avatar),
      },
    });

    roomUsers.forEach((roomUser) => {
      if (roomUser.data.user.id == user.id) {
        roomUser.leave(`channel-${channel.id}`);
      }
    });
  }

  async deleteChannel(channel: Channel) {
    await this.server
      .to(`channel-${channel.id}`)
      .emit('delete', { channel: channel.id });

    await this.server
      .in(`channel-${channel.id}`)
      .socketsLeave(`channel-${channel.id}`);
  }
}
