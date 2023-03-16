import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlTokenBlackList } from './entity/sql-token-black-list.entity';

@Injectable()
export class JwtRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkTokenInBlackList(refreshToken: string): Promise<boolean> {
    return await this.dataSource
      .getRepository('token_black_list')
      .createQueryBuilder('bl')
      .where('bl.token = :token', { token: refreshToken })
      .getExists();
  }

  async addTokenInBlackList(refreshToken: string): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(SqlTokenBlackList)
      .save({ token: refreshToken });

    if (!result) {
      return false;
    }
    return true;
  }
}
