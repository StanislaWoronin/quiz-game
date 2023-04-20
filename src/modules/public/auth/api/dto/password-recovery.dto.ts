import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class PasswordRecoveryDto {
  @ApiProperty({description: 'Mail registered account, which will be a password recovery code'})
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;
}
