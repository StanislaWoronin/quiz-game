import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class PasswordRecoveryDto {
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;
}
