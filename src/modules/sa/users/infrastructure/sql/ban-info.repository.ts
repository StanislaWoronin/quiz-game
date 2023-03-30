import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlUserBanInfo } from './entity/ban-info.entity';
import { IUserBanInfoRepository } from '../i-user-ban-info.repository';

export class UserBanInfoRepository implements IUserBanInfoRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkBanStatus(userId: string): Promise<boolean> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select('bi."isBanned"', 'isBanned')
      .from(SqlUserBanInfo, 'bi')
      .where('bi.userId = :id', { id: userId });
    const result = await builder.getExists();

    return result;
  }
}
