import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from 'src/prisma/user/user.service';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { DoublefaService } from './doublefa.service';
import { TwoFACode } from './dto/twoFACode.dto';

@Controller('auth/2fa')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiSecurity('access-token')
@ApiTags('Profil')
export class DoublefaController {
  constructor(
    private readonly twoFAService: DoublefaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: "Ajouter le 2FA au compte de l'utilisateur" })
  @ApiForbiddenResponse({
    description: "Le 2FA a déjà été activé par l'utilisateur",
  })
  @ApiCreatedResponse({
    description:
      "L'utilisateur a demandé à activer le 2FA. Il faut qu'il le valide",
    content: { 'image/png': { schema: { type: 'string', format: 'binary' } } },
  })
  async register(@Res() response, @Req() request) {
    if (request.user.otp_enable)
      throw new HttpException('Already Enabled', HttpStatus.FORBIDDEN);
    const { url } = await this.twoFAService.generateTwoFASecret(request.user);
    return this.twoFAService.pipeQrCodeStream(response, url);
  }

  @Post('enable')
  @ApiOperation({
    summary: "L'utilisateur valide le 2FA qu'il a activé précédemment",
  })
  @ApiCreatedResponse({ description: "L'utilisateur a bien été mis à jour" })
  @ApiForbiddenResponse({
    description: "L'utilisateur n'a pas fournis le bon code",
  })
  @ApiBadRequestResponse({
    description: "L'utilisateur n'a pas demandé à activer le 2FA",
  })
  async turnOn(@Req() request, @Body() { code }: TwoFACode) {
    if (!request.user.otp_secret)
      throw new HttpException('No 2FA Code given', HttpStatus.BAD_REQUEST);

    const isCodeValid = await this.twoFAService.isTwoFAValid(
      code,
      request.user,
    );
    if (!isCodeValid)
      throw new HttpException(
        'Wrong authentication code',
        HttpStatus.FORBIDDEN,
      );
    await this.userService.turnOnTwoFA(request.user.id);
  }

  @Post('authenticate')
  @ApiTags('Authentification')
  async authenticate(
    @Req() request,
    @Body() { code }: TwoFACode,
  ): Promise<any> {
    const isCodeValid = await this.twoFAService.isTwoFAValid(
      code,
      request.user,
    );

    if (!isCodeValid && this.configService.get('ENV') != 'local')
      throw new UnauthorizedException('Wrong authentication code');
    return this.authService.login(request.user, true);
  }
}
