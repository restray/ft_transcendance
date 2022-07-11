import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import conf from 'package.json';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { UserfieldsInterceptor } from './prisma/user/userfields.interceptor';

function getConfigApiDoc() {
  return new DocumentBuilder()
    .setTitle('FT_Transcendance 42')
    .setDescription(
      "L'API du backend du transcendance de tbelhomm, pleveque et oel-ahma",
    )
    .setVersion(conf.version)
    .addTag('Authentification')
    .addOAuth2({
      name: 'Intra 42',
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://api.intra.42.fr/oauth/authorize',
          tokenUrl: 'https://api.intra.42.fr/oauth/token',
          scopes: {
            public:
              "Récupérer les informations de base du profile de l'utilisateur",
          },
        },
      },
    })
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addServer('http://localhost:3000/', 'Serveur Local')
    .build();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new UserfieldsInterceptor());

  // Setup the API Documentation for env "local"
  // Accessible on /api
  const configService = app.get(ConfigService);
  if (configService.get('ENV') == 'local') {
    const config = getConfigApiDoc();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        oauth2RedirectUrl: 'http://localhost:3000/auth/login',
      },
    });
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
