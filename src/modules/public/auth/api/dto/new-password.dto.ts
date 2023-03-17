import { IsString, Length, Validate } from 'class-validator';
import {PasswordRecoveryValidator} from "../../guards/password-recovery.validator";

export class NewPasswordDto {
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  @Validate(PasswordRecoveryValidator)
  recoveryCode: string;
}
