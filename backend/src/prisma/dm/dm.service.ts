import { Injectable } from '@nestjs/common';
import { DMChannel, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UserPublicInformations } from '../user/user.public.interface';

@Injectable()
export class DmService {
  constructor(private prisma: PrismaService) {}

  async get(user: User) {
    return await this.prisma.dMChannel.findMany({
      where: {
        DMChannelUser: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        DMChannelMessage: {
          include: {
            DMChannelUser: {
              include: {
                user: UserPublicInformations,
              },
            },
          },
        },
        DMChannelUser: {
          include: {
            user: UserPublicInformations,
          },
        },
      },
    });
  }

  async channel(cond: Prisma.DMChannelWhereInput) {
    return await this.prisma.dMChannel.findFirst({
      where: cond,
      include: {
        DMChannelMessage: true,
        DMChannelUser: {
          include: {
            user: UserPublicInformations,
          },
        },
      },
    });
  }

  async create(emitter: number, target: number) {
    return await this.prisma.dMChannel.create({
      data: {
        DMChannelUser: {
          createMany: {
            data: [
              {
                userId: emitter,
              },
              {
                userId: target,
              },
            ],
          },
        },
      },
    });
  }

  async sendMessage(channel: DMChannel, emitter: User, content: string) {
    return await this.prisma.dMChannelMessage.create({
      data: {
        content,
        DmChannel: channel.id,
        userId: emitter.id,
      },
      include: {
        DMChannel: true,
      },
    });
  }
}
