import { InjectDataSource } from '@nestjs/typeorm';
import {DataSource} from "typeorm";
import {SqlUserBanInfo} from "./entity/ban-info.entity";

export class UserBanInfoRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkBanStatus(userId: string): Promise<boolean> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select('bi.banStatus', 'isBanned')
      .from(SqlUserBanInfo, 'bi')
      .where('bi.userId = :id', { id: userId });
    const result = await builder.getOne()

    return result.isBanned
  }
}