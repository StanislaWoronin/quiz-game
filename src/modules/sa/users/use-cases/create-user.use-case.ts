import { Injectable } from '@nestjs/common';
import { SqlEmailConfirmation } from '../../../public/auth/infrastructure/sql/entity/email-confirmation.entity';
import { UsersService } from '../applications/users.service';
import { RegistrationDto } from '../../../public/auth/api/dto/registration.dto';
import { EmailManager } from '../../../public/auth/email-transfer/email.manager';
import {randomUUID} from "crypto";
import add from "date-fns/add";
import {settings} from "../../../../settings";

@Injectable()
export class CreateUserUseCase {
  constructor(
    protected emailManager: EmailManager,
    protected usersService: UsersService,
  ) {}

  async execute(dto: RegistrationDto): Promise<boolean> {
    const emailConfirmation = new SqlEmailConfirmation(
        randomUUID(),
        false,
        randomUUID(),
        add(new Date(), {
          hours: Number(settings.timeLife.CONFIRMATION_CODE),
        }).toISOString(),

    );

    await this.emailManager.sendConfirmationEmail(
      dto.email,
      emailConfirmation.confirmationCode,
    );

    await this.usersService.createUser(dto, emailConfirmation);
    return true;
  }
}
