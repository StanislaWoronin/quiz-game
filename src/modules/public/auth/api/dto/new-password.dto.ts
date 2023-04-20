import { IsString, Length, Validate } from 'class-validator';
import { PasswordRecoveryValidator } from '../../guards/password-recovery.validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordDto {
  @ApiProperty({
    description: 'New password',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @ApiProperty({ description: 'Password recovery code' })
  @IsString()
  @Validate(PasswordRecoveryValidator)
  recoveryCode: string;
}
