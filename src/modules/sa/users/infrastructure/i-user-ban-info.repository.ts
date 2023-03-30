export interface IUserBanInfoRepository {
  checkBanStatus(userId: string): Promise<boolean>;
}

export const IUserBanInfoRepository = 'IUserBanInfoRepository';
