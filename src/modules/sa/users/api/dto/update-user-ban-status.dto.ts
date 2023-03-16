import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateUserBanStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @MinLength(20)
  banReason;
}
