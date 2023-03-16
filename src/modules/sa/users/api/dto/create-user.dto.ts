import {IsEmail, IsNotEmpty, IsString, Length, Matches, Validate} from "class-validator";
import { Transform } from 'class-transformer';
import {EmailExistValidator} from "../../../../../common/validators/email-exists.validator";
import {LoginExistValidator} from "../../../../../common/validators/login-exist.validator";

export class CreateUserDto {
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Validate(LoginExistValidator)
    @Length(3, 10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    login: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    @Length(6, 20)
    password: string;

    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    @Validate(EmailExistValidator)
    @IsString()
    @IsEmail()
    email: string;
}