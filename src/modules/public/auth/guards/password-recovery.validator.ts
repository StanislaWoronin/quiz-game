import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IEmailConfirmationRepository } from '../../../sa/users/infrastructure/i-email-confirmation.repository';

@ValidatorConstraint({ name: 'ConfirmationCodeValidator', async: true })
@Injectable()
export class PasswordRecoveryValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IEmailConfirmationRepository)
    protected emailConfirmationRepository: IEmailConfirmationRepository,
  ) {}

  async validate(code: string) {
    const emailConfirmation =
      await this.emailConfirmationRepository.getEmailConfirmationByCode(code);

    if (!emailConfirmation) {
      return false;
    }

    if (new Date(emailConfirmation.expirationDate) > new Date()) {
      return false;
    }

    //request.userId = emailConfirmation.userId;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password recovery is not valid';
  }
}
