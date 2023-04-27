import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ViewSecurity } from '../../api/view/view-security';
import { SqlSecurity } from './entity/security';
import { ISecurityQueryRepository } from '../i-security-query.repository';

@Injectable()
export class SecurityQueryRepository implements ISecurityQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllActiveSessions(userId: string): Promise<ViewSecurity[]> {
    const builder = this.dataSource
      .createQueryBuilder()
      .addSelect('s.deviceId', 'deviceId')
      .addSelect('s.deviceTitle', 'title')
      .addSelect('s.ipAddress', 'ip')
      .addSelect('s.iat', 'lastActiveDate')
      .from(SqlSecurity, 's')
      .where('s.userId = :id', { id: userId });

    return await builder.getRawMany();
  }

  async getDeviceById(deviceId: string): Promise<SqlSecurity | null> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select('s.userId', 'userId')
      .addSelect('s.deviceId', 'deviceId')
      .addSelect('s.deviceTitle', 'deviceTitle')
      .addSelect('s.ipAddress', 'ipAddress')
      .addSelect('s.iat', 'iat')
      .addSelect('s.exp', 'exp')
      .from(SqlSecurity, 's')
      .where('s.deviceId = :id', { id: deviceId });

    return await builder.getRawOne();
  }
}
