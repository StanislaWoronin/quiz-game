import { IsString, Validate } from 'class-validator';
import { ConfirmationCodeValidator } from '../../../../../common/validators/confirmation-code.validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationConfirmationDto {
  @ApiProperty({ description: 'Registration confirmation code' })
  @IsString()
  @Validate(ConfirmationCodeValidator)
  code: string;
}
