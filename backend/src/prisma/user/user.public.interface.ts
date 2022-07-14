import { Prisma, Status } from '@prisma/client';

export default interface UserPublic {
  id: number;
  name: string;
  status: Status;
  avatar: string;
  otp_enable: boolean;
}

export const UserPublicInformations: Prisma.UserArgs = {
  select: {
    id: true,
    name: true,
    avatar: true,
    status: true,
  },
};
