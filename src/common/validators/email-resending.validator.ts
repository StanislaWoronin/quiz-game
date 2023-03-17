import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { request } from 'express';
import {IEmailConfirmationRepository} from "../../modules/sa/users/infrastructure/i-email-confirmation.repository";
import {IUsersQueryRepository} from "../../modules/sa/users/infrastructure/i-users-query.repository";

@ValidatorConstraint({ name: 'EmailResendingValidator', async: true })
@Injectable()
export class EmailResendingValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IEmailConfirmationRepository)
    protected emailConfirmationRepository: IEmailConfirmationRepository,
    @Inject(IUsersQueryRepository)
    protected queryUsersRepository: IUsersQueryRepository,
  ) {}

  async validate(email) {
    const user = await this.queryUsersRepository.getUserByLoginOrEmail(email);

    if (!user) {
      return false;
    }

    const isConfirmed =
      await this.emailConfirmationRepository.checkConfirmation(user.id);

    if (isConfirmed) {
      return false;
    }

    request.email = user.email;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email is already confirm';
  }
}
