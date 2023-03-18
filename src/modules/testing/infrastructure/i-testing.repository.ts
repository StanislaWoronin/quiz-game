export interface ITestingRepository {
  deleteAll(): Promise<boolean>;
  getAllRowCount(): Promise<number>;

  getUserPassword(userId: string)
  getConfirmationCode(userId: string): Promise<{ confirmationCode: string }>;
  checkUserConfirmed(userId: string)
  makeExpired(userId: string, expirationDate: string): Promise<boolean>;
}

export const ITestingRepository = 'ITestingRepository';
