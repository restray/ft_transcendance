import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class EditProfileDTO {
  @IsString()
  @ApiProperty({
    name: 'name',
    description: "Nouveau nom de l'uilisateur",
    example: 'pleveque',
  })
  @MinLength(3)
  @MaxLength(50)
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
  @Transform(({ value }) => value === 'true')
  otp_enabled: boolean;
}
