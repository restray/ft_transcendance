import { Injectable } from '@nestjs/common';
import { DMChannel, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

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
    });
  }

  async channel(cond: Prisma.DMChannelWhereInput) {
    return await this.prisma.dMChannel.findFirst({
      where: cond,
      include: {
        DMChannelMessage: true,
        DMChannelUser: {
          include: {
            user: {
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
