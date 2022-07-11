import {
  ChannelType,
  ChannelUserStatus,
  FriendShipStatus,
  PrismaClient,
} from '@prisma/client';
import * as argon2 from 'argon2';

(() => {
  const prisma = new PrismaClient();

  createUsers(prisma);
  createFriendships(prisma);
  createChannels(prisma);
})();

// Create users
async function createUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        intra_id: '1',
        name: 'Admin',
      },
      {
        id: 2,
        intra_id: '2',
        name: 'JeSuisUnBot',
      },
      {
        id: 3,
        intra_id: '3',
        name: 'BobLenon',
      },
      {
        id: 4,
        intra_id: '4',
        name: 'AntoineDaniel',
      },
      {
        id: 5,
        intra_id: '5',
        name: 'PasAdmin',
      },
    ],
  });
}

// Create friendships
async function createFriendships(prisma: PrismaClient) {
  await prisma.friendShip.createMany({
    data: [
      {
        receiverId: 1,
        requesterId: 2,
        status: FriendShipStatus.WAITING,
      },
      {
        receiverId: 1,
        requesterId: 3,
        status: FriendShipStatus.BLOCKED,
      },
      {
        receiverId: 1,
        requesterId: 4,
        status: FriendShipStatus.ACCEPTED,
      },
      {
        receiverId: 2,
        requesterId: 3,
        status: FriendShipStatus.ACCEPTED,
      },
      {
        receiverId: 4,
        requesterId: 3,
        status: FriendShipStatus.ACCEPTED,
      },
    ],
  });
}

async function createChannels(prisma: PrismaClient) {
  await prisma.channel.createMany({
    data: [
      {
        id: 1,
        name: 'Channel Admin',
        ownerId: 1,
        type: ChannelType.PRIVATE,
      },
      {
        id: 2,
        name: 'Candidature modérateur',
        ownerId: 4,
        type: ChannelType.PROTECTED,
        password: await argon2.hash('password'),
      },
      {
        id: 3,
        name: 'Public',
        ownerId: 2,
        type: ChannelType.PUBLIC,
      },
    ],
  });

  await prisma.channelUser.createMany({
    data: [
      // Channel "Admin"
      {
        channelId: 1,
        userId: 1, // User "Admin"
        state: ChannelUserStatus.ADMIN,
      },
      {
        channelId: 1,
        userId: 4, // User "AntoineDaniel"
        state: ChannelUserStatus.USER,
      },
      {
        channelId: 1,
        userId: 2, // User "Bot"
        state: ChannelUserStatus.BAN,
      },

      // Channel "modérateur"
      {
        channelId: 2,
        userId: 4, // User "AntoineDaniel"
        state: ChannelUserStatus.ADMIN,
      },
      {
        channelId: 2,
        userId: 1, // User "Admin"
        state: ChannelUserStatus.ADMIN,
      },

      // Channel "Public"
      {
        channelId: 3,
        userId: 2, // User "Bot"
        state: ChannelUserStatus.ADMIN,
      },
    ],
  });
}
