import { Injectable } from '@nestjs/common';
import {
  Channel,
  ChannelMessageType,
  ChannelType,
  ChannelUserStatus,
  Prisma,
  User,
} from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async channelsForUser(user: User) {
    return this.prisma.channel.findMany({
      where: {
        users: {
          some: {
            userId: user.id,
            NOT: [
              { state: ChannelUserStatus.BAN },
              { state: ChannelUserStatus.KICK },
            ],
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                id: true,
              },
            },
          },
        },
        messages: {
          include: {
            User: true,
          },
        },
      },
    });
  }

  async create(name: string, type: ChannelType, password: string, owner: User) {
    let hashedPassword: null | string = null;
    if (type == ChannelType.PROTECTED) {
      hashedPassword = await hash(password);
    }

    return this.prisma.channel.create({
      data: {
        name,
        type,
        owner: {
          connect: {
            id: owner.id,
          },
        },
        users: {
          create: [
            {
              userId: owner.id,
              state: ChannelUserStatus.ADMIN,
            },
          ],
        },
        password: hashedPassword,
      },
    });
  }

  async channel(id: number, start = 0, take = 1) {
    return this.prisma.channel.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                id: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            id: 'desc',
          },
          take,
          skip: start,
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async update(channel: Channel, password?: string) {
    let hashedPassword: null | string = null;
    if (channel.type == ChannelType.PROTECTED) {
      hashedPassword = await hash(password);
    }

    return this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        name: channel.name,
        type: channel.type,
        password: hashedPassword,
      },
    });
  }

  async isUserInChannel(channel_id: number, user: User) {
    const users = await this.prisma.channelUser.findFirst({
      where: {
        channelId: channel_id,
        userId: user.id,
        OR: [
          { state: ChannelUserStatus.USER },
          { state: ChannelUserStatus.MODERATOR },
          { state: ChannelUserStatus.ADMIN },
          { state: ChannelUserStatus.MUTE },
        ],
      },
      select: {
        state: true,
      },
    });

    if (!users) return false;

    if (users.state == ChannelUserStatus.MUTE)
      return {
        muted: true,
      };
    return {
      muted: false,
    };
  }

  async addMessage(channel_id: number, user: User, message: string) {
    return this.prisma.channelMessage.create({
      data: {
        content: message,
        channelId: channel_id,
        userId: user.id,
        channelUserUserId: user.id,
        channelUserChannelId: channel_id,
        type: ChannelMessageType.MESSAGE,
      },
    });
  }

  async channelUser(id: number, user: User) {
    return this.prisma.channel.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          where: {
            userId: user.id,
          },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async addUser(channel: Channel, user: User) {
    return this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        users: {
          create: [
            {
              userId: user.id,
              state: ChannelUserStatus.USER,
            },
          ],
        },
      },
    });
  }

  async updateUser(
    channel: Channel,
    user: Prisma.ChannelWhereUniqueInput,
    state: ChannelUserStatus,
    endDate?: Date,
  ) {
    return this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        users: {
          updateMany: {
            where: {
              userId: user.id,
              channelId: channel.id,
            },
            data: {
              state,
              until: endDate,
            },
          },
        },
      },
    });
  }

  async removeUser(channel: Channel, user: User) {
    return this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        users: {
          deleteMany: [
            {
              userId: user.id,
              channelId: channel.id,
            },
          ],
        },
      },
    });
  }

  async delete(channel: Channel) {
    return this.prisma.channel.deleteMany({
      where: {
        id: channel.id,
      },
    });
  }
}
