import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlTokenBlackList } from './entity/sql-token-black-list.entity';
import { IJwtRepository } from '../i-jwt.repository';

@Injectable()
export class JwtRepository implements IJwtRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkTokenInBlackList(refreshToken: string): Promise<boolean> {
    const builder = this.dataSource
      .getRepository('sql_token_black_list')
      .createQueryBuilder('bl')
      .where('bl.token = :token', { token: refreshToken });
    return await builder.getExists();
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
