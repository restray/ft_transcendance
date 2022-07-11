import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class EditProfileDTO {
  @IsString()
  @ApiProperty({
    name: 'name',
    description: "Nouveau nom de l'uilisateur",
    example: 'pleveque',
  })
  @MaxLength(50)
  @MinLength(10)
  name: string;

  @ApiPropertyOptional({
    name: 'avatar',
    description: "Nouvelle image de profile de l'utilisateur",
    type: 'file',
  })
  avatar;

  @IsBoolean()
  @ApiProperty({
    name: 'otp_enabled',
    description: "Etat du 2FA pour l'utilisateur",
    example: 'false',
  })
  otp_enabled: boolean;
}
