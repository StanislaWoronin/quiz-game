import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IEmailConfirmationRepository } from '../../modules/sa/users/infrastructure/i-email-confirmation.repository';
import { IUsersQueryRepository } from '../../modules/sa/users/infrastructure/i-users-query.repository';
import { request } from 'express';

@ValidatorConstraint({ name: 'EmailResendingValidator', async: true })
@Injectable()
export class EmailResendingValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IEmailConfirmationRepository)
    protected emailConfirmationRepository: IEmailConfirmationRepository,
    @Inject(IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async validate(email) {
    const userId = await this.usersQueryRepository.getUserByLoginOrEmail(email);

    if (!userId) {
      return false;
    }

    const isConfirmed =
      await this.emailConfirmationRepository.checkConfirmation(userId);

    if (isConfirmed) {
      return false;
    }

    request.userId = userId;
    //request.email = user.email;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email is already confirm';
  }
}
