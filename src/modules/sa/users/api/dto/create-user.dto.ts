import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmailExistValidator } from '../../../../../common/validators/email-exists.validator';
import { LoginExistValidator } from '../../../../../common/validators/login-exist.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'UserLogin', description: 'User`s login' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Validate(LoginExistValidator)
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @ApiProperty({ example: 'UserPassword', description: 'User`s password' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(6, 20)
  password: string;

  @ApiProperty({ example: 'UserEmail', description: 'User`s email' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Validate(EmailExistValidator)
  @IsString()
  @IsEmail()
  email: string;
}
