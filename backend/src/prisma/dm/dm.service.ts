import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { emit } from 'process';
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

  async create(emitter: User, target: User) {
    return await this.prisma.dMChannel.create({
      data: {
        DMChannelUser: {
          createMany: {
            data: [
              {
                userId: emitter.id,
              },
              {
                userId: target.id,
              },
            ],
          },
        },
      },
    });
  }
}
