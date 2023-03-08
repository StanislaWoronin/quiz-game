export interface ITestingRepository {
  deleteAll(): Promise<boolean>;
  getAllRowCount(): Promise<number>;
}

export const ITestingRepository = 'ITestingRepository';
