import add from 'date-fns/add';
import { Inject, Injectable } from '@nestjs/common';
import { EmailManager } from '../email-transfer/email.manager';
import { IEmailConfirmationRepository } from '../../../sa/users/infrastructure/i-email-confirmation.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(IEmailConfirmationRepository)
    protected emailConfirmationRepository: IEmailConfirmationRepository,
    protected emailsManager: EmailManager,
  ) {}

  async sendPasswordRecovery(userId: string, email: string): Promise<boolean> {
    const newRecoveryCode = randomUUID();
    const result =
      await this.emailConfirmationRepository.updateConfirmationCode(
        userId,
        newRecoveryCode,
        add(new Date(), { hours: 24 }).toISOString(),
      );

    if (!result) {
      return false;
    }

    await this.emailsManager.sendPasswordRecoveryEmail(email, newRecoveryCode);
    return true;
  }

  async updateConfirmationCode(userId: string): Promise<string | null> {
    const newConfirmationCode = randomUUID();

    const result =
      await this.emailConfirmationRepository.updateConfirmationCode(
        userId,
        newConfirmationCode,
        add(new Date(), { hours: 24 }).toISOString(),
      );

    if (!result) {
      return null;
    }

    return newConfirmationCode;
  }
}
