import { Injectable } from '@nestjs/common';
import { UserService } from 'src/prisma/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async retrieveUserFromToken(data: any): Promise<any> {
    let user = await this.userService.user({
      intra_id: data.id.toString(),
    });
    if (!user)
      user = await this.userService.create(data.login, data.id.toString());
    return user;
  }

  async login(user: User, doublefa = false) {
    const payload = { username: user.name, sub: user.id, doublefa: doublefa };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.get(
          'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        )}s`,
      }),
      '2fa_needed': user.otp_enable && !doublefa,
    };
  }
}
