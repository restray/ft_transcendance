import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiMovedPermanentlyResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LocalEnvGuard } from 'src/dev/local-env.guard';
import { UserService } from 'src/prisma/user/user.service';
import { AuthService } from './auth.service';
import AuthDTO from './dto/auth.dto';
import ResponseLoginDTO from './dto/response_login.dto';
import { IntraAuthGuard } from './guards/intra.guard';

@Controller('auth')
@ApiTags('Authentification')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('login')
  @UseGuards(IntraAuthGuard)
  @ApiMovedPermanentlyResponse({
    description:
      "L'utilisateur est redirigé sur l'intra de 42 pour s'authentifier",
  })
  @ApiForbiddenResponse({
    description: "Le code donné par l'utilisateur est incorrect.",
  })
  @ApiOkResponse({
    description: "L'utilisateur est authentifié",
    type: ResponseLoginDTO,
  })
  @ApiOperation({
    summary: "Authentifier l'utilisateur sur l'OAUTH2 de l'intra 42",
  })
  logUser(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    authReq: AuthDTO,
    @Request() req,
  ) {
    return this.authService.login(req.user);
  }

  @Get('tokens')
  @UseGuards(LocalEnvGuard)
  @ApiOperation({
    summary:
      '/!\\ Développement /!\\ only Récupérer la liste des utilisateurs avec leurs Tokens JWT',
    description:
      'Récupérer une liste des utilisateurs inscrits. Utilisable uniquement quand le .env possède ENV=local',
    deprecated: true,
  })
  async retrieveUsersToken() {
    const users_tokens = [];

    const users = await this.userService.users();
    users.forEach(async (user) => {
      users_tokens.push({
        user,
        token: await this.authService.login(user, true),
      });
    });
    return users_tokens;
  }
}
