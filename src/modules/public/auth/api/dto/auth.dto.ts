import { IsString, Length, maxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { settings } from '../../../../../settings';

export class AuthDto {
  @ApiProperty()
  @IsString({})
  @Transform(({ value }) => value?.trim())
  @Length(settings.validationConstant.loginLength.min)
  loginOrEmail: string;

  @ApiProperty({
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
}
