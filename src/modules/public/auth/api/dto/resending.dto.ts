import { IsEmail, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmailResendingValidator } from '../../../../../common/validators/email-resending.validator';

export class ResendingDto {
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  @Validate(EmailResendingValidator)
  email: string;
}
