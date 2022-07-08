import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Status, User } from '@prisma/client';

export interface UserRequest {
  id: number;
  name: string;
  avatar?: string;
}

export function localUploadToURL(avatar: string) {
  return avatar.replace('uploads/', 'static/');
}

@Injectable()
export class UserService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Dans le cas d'un crash, on remet tous les utilisateurs en offline
    // pour éviter que leurs statuts soient altéré
    this.prisma.user.updateMany({
      data: {
        status: Status.OFFLINE,
      },
    });
  }

  async users(): Promise<User[] | null> {
    return this.prisma.user.findMany();
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async create(name: string, intra_id: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: name,
        intra_id: intra_id,
      },
    });
  }
  async setTwoFASecret(secret: string, id: number): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        otp_secret: secret,
      },
    });
  }
  async turnOnTwoFA(id: number): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        otp_enable: true,
      },
    });
  }
  async updateStatus(user: User, status: Status) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: status,
      },
    });
  }

  async setAllUsersOffline() {
    await this.prisma.user.updateMany({
      data: {
        status: Status.OFFLINE,
      },
    });
  }

  async updateUser(user: User) {
    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: user.avatar,
        name: user.name,
      },
    });
  }
}
