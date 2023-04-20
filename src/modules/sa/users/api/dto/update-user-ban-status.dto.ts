import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { settings } from '../../../../../settings';

export class UpdateUserBanStatusDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @ApiProperty({ minLength: settings.validationConstant.banReasonLength.min })
  @IsString()
  @MinLength(settings.validationConstant.banReasonLength.min)
  banReason: string;
}
