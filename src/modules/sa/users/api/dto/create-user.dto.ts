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
import { settings } from '../../../../../settings';

export class CreateUserDto {
  @ApiProperty({
    example: 'UserLogin',
    description: 'User`s login',
    maxLength: settings.validationConstant.loginLength.max,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Validate(LoginExistValidator)
  @Length(
    settings.validationConstant.loginLength.min,
    settings.validationConstant.loginLength.max,
  )
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @ApiProperty({
    example: 'qwerty123',
    description: 'User`s password',
    minLength: settings.validationConstant.passwordLength.min,
    maxLength: settings.validationConstant.passwordLength.max,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(
    settings.validationConstant.passwordLength.min,
    settings.validationConstant.passwordLength.max,
  )
  password: string;

  @ApiProperty({ example: 'somemail@mail.com', description: 'User`s email' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Validate(EmailExistValidator)
  @IsString()
  @IsEmail()
  email: string;
}
