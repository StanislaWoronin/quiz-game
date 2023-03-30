import { IsString, Validate } from 'class-validator';
import { ConfirmationCodeValidator } from '../../../../../common/validators/confirmation-code.validator';

export class RegistrationConfirmationDto {
  @IsString()
  @Validate(ConfirmationCodeValidator)
  code: string;
}
