import { Injectable } from '@nestjs/common';
import { UsersService } from '../applications/users.service';
import { RegistrationDto } from '../../../public/auth/api/dto/registration.dto';
import { EmailManager } from '../../../public/auth/email-transfer/email.manager';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { settings } from '../../../../settings';
import { SqlEmailConfirmation } from '../infrastructure/sql/entity/sql-email-confirmation.entity';
import { EmailConfirmationDto } from '../applications/dto/email-confirmation.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    protected emailManager: EmailManager,
    protected usersService: UsersService,
  ) {}

  async execute(dto: RegistrationDto): Promise<boolean> {
    const emailConfirmation = new EmailConfirmationDto(false);

    await this.emailManager.sendConfirmationEmail(
      dto.email,
      emailConfirmation.confirmationCode,
    );

    await this.usersService.createUser(dto, emailConfirmation);
    return true;
  }
}
