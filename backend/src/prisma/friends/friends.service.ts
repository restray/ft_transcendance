import { Injectable } from '@nestjs/common';
import { FriendShipStatus, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prismaService: PrismaService) {}

  async relations(user: User) {
    return this.prismaService.friendShip.findMany({
      where: {
        OR: [{ requester: user }, { receiver: user }],
      },
      select: {
        status: true,
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async friends(user: User) {
    return this.prismaService.friendShip.findMany({
      where: {
        OR: [{ requester: user }, { receiver: user }],
        status: FriendShipStatus.ACCEPTED,
      },
      select: {
        status: true,
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async pendingRequests(user: User) {
    return this.prismaService.friendShip.findMany({
      where: {
        OR: [{ requester: user }, { receiver: user }],
      },
    });
  }

  async relationWith(user1: User, user2: User) {
    return this.prismaService.friendShip.findFirst({
      where: {
        OR: [
          {
            AND: [{ requester: user1 }, { receiver: user2 }],
          },
          {
            AND: [{ receiver: user1 }, { requester: user2 }],
          },
        ],
      },
      select: {
        status: true,
        requester: true,
        requesterId: true,
      },
      orderBy: {
        requesterId: user1.id < user2.id ? 'asc' : 'desc',
      },
    });
  }

  async friendsWith(
    user1: Prisma.UserWhereUniqueInput,
    user2: Prisma.UserWhereUniqueInput,
  ) {
    return this.prismaService.friendShip.findFirst({
      where: {
        OR: [
          {
            AND: [{ requester: user1 }, { receiver: user2 }],
          },
          {
            AND: [{ requester: user2 }, { receiver: user1 }],
          },
        ],
      },
      select: {
        status: true,
        requester: true,
      },
    });
  }

  async createFriendShip(
    user1: User,
    user2: User,
    status: FriendShipStatus = FriendShipStatus.WAITING,
  ) {
    return this.prismaService.friendShip.create({
      data: {
        requester: { connect: { id: user1.id } },
        receiver: { connect: { id: user2.id } },
        status: status,
      },
      include: {
        receiver: true,
        requester: true,
      },
    });
  }

  async acceptFriendShip(user1: User, user2: User) {
    return this.prismaService.user.update({
      where: {
        id: user1.id,
      },
      data: {
        friendProposal: {
          updateMany: {
            where: {
              requesterId: user2.id,
            },
            data: {
              status: FriendShipStatus.ACCEPTED,
            },
          },
        },
      },
      include: {
        friendProposal: true,
        friendRequest: true,
      },
    });
  }

  async deleteFriendShip(user1: User, user2: User) {
    return this.prismaService.user.update({
      where: {
        id: user1.id,
      },
      data: {
        friendRequest: {
          deleteMany: {
            receiverId: user2.id,
          },
        },
        friendProposal: {
          deleteMany: {
            requesterId: user2.id,
          },
        },
      },
      include: {
        friendProposal: true,
        friendRequest: true,
      },
    });
  }

  async deleteSpecificFriendShip(user1: User, user2: User) {
    return this.prismaService.user.update({
      where: {
        id: user1.id,
      },
      data: {
        friendRequest: {
          deleteMany: {
            receiverId: user2.id,
          },
        },
      },
      include: {
        friendRequest: true,
      },
    });
  }
}
