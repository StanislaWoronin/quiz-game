import {IsEmail, IsString, Length, Matches} from "class-validator";

export class CreateUserDto {
    @IsString()
    @Length(3, 10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    login: string;

    @IsString()
    @Length(6, 20)
    password: string;

    @IsString()
    @IsEmail()
    email: string;
}