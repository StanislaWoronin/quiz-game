export interface ITestingRepository {
  deleteAll(): Promise<boolean>
}

export const ITestingRepository = 'ITestingRepository'