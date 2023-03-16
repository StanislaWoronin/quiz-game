import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IUsersQueryRepository } from '../../modules/sa/users/infrastructure/i-users-query.repository';

@Injectable()
@ValidatorConstraint({ name: 'email', async: true })
export class EmailExistValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IUsersQueryRepository)
    protected usersRepository: IUsersQueryRepository,
  ) {}

  async validate(email) {
    const user = await this.usersRepository.isLoginOrEmailExist(email);

    if (user) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This email already exists';
  }
}
