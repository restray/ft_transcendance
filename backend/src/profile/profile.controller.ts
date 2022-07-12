import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { unlink } from 'fs';
import multer from 'multer';
import path from 'path';
import Jwt2FAGuard from 'src/auth/guards/jwt-2fa.guard';
import UserPublic from 'src/prisma/user/user.public.interface';
import { localUploadToURL, UserService } from 'src/prisma/user/user.service';
import { EditProfileDTO } from './dto/profile.dto';

@Controller('profile')
@ApiSecurity('access-token')
@ApiTags('Profil')
@UseGuards(Jwt2FAGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: "Récupérer les informations du profile de l'utilisateur",
  })
  async showPersonnalPage(@Req() req): Promise<UserPublic> {
    return <UserPublic>{
      id: req.user.id,
      name: req.user.name,
      status: req.user.status,
      avatar: localUploadToURL(req.user.avatar),
      otp_enable: req.user.otp_enable,
    };
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Editer les informations de l'utilisateur connecté",
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        files: 1,
        fileSize: 5000000,
      },
      fileFilter: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        const mimetyp = file.mimetype;
        if (
          extension !== '.jpg' &&
          extension !== '.jpeg' &&
          extension !== '.png' &&
          mimetyp !== 'image/png' &&
          mimetyp !== 'image/jpg' &&
          mimetyp !== 'image/jpeg'
        ) {
          cb(new BadRequestException('Uploaded file is not an image'), true);
        }
        cb(null, true);
      },
      storage: multer.diskStorage({
        destination: './uploads/user/',
        filename: function (req, file, callback) {
          callback(
            null,
            `${file.fieldname}_${Date.now()}${path
              .extname(file.originalname)
              .toLowerCase()}`,
          );
        },
      }),
    }),
  )
  async editProfile(
    @Req() req,
    @Body() updateDto: EditProfileDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let newImage = req.user.avatar;
    if (file && file.size > 0) {
      if (req.user.avatar)
        unlink(path.join(process.cwd(), req.user.avatar), null);
      newImage = path.join(file.destination, file.filename);
    }

    let newPseudo = req.user.name;
    if (
      updateDto.name &&
      updateDto.name != newPseudo &&
      updateDto.name.length < 50
    ) {
      const userSameName = await this.userService.user({
        name: updateDto.name,
      });
      if (userSameName)
        throw new BadRequestException({ name: 'Name already used' });
      newPseudo = updateDto.name;
    }

    if (newImage == req.user.avatar && newPseudo == req.user.name)
      throw new BadRequestException({ name: 'No field are modified' });

    if (req.user.otp_enabled) {
      if (!updateDto.otp_enabled) req.user.otp_enabled = false;
    } else {
      if (updateDto.otp_enabled)
        throw new BadRequestException("Can't define 2FA in this part.");
    }

    req.user.name = newPseudo;
    req.user.avatar = newImage;
    return await this.userService.updateUser(req.user);
  }

  @Get('/:id')
  @ApiOperation({
    summary: "Récupérer les informations d'un utilisateur",
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID du channel à récupérer',
  })
  @ApiOkResponse({
    description: "L'utilisateur avec cet ID",
  })
  @ApiNotFoundResponse({
    description: "Aucun utilisateur n'existe avec cet id",
  })
  async getUser(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    const user = await this.userService.user({
      id,
    });
    if (!user) throw new NotFoundException();

    return {
      id: user.id,
      name: user.name,
      avatar: localUploadToURL(user.avatar),
    };
  }
}
