import { IsEmail, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmailResendingValidator } from '../../../../../common/validators/email-resending.validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendingDto {
  @ApiProperty({
    description: 'E-mail to which the confirmation code will be sent',
  })
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  @Validate(EmailResendingValidator)
  email: string;
}
