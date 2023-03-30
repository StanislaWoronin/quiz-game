import { SqlEmailConfirmation } from './sql/entity/sql-email-confirmation.entity';

export interface IEmailConfirmationRepository {
  getEmailConfirmationByCode(
    code: string,
  ): Promise<SqlEmailConfirmation | null>;
  checkConfirmation(userId: string): Promise<boolean | null>;
  updateConfirmationInfo(confirmationCode: string): Promise<boolean>;
  updateConfirmationCode(
    userId: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<boolean>;
  deleteEmailConfirmationById(userId: string): Promise<boolean>;
}

export const IEmailConfirmationRepository = 'IEmailConfirmationRepository';
