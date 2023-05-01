import { Injectable } from '@nestjs/common';
import { ISecurityQueryRepository } from '../i-security-query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { MongoSecurity, SecurityDocument } from './schema/security.schema';
import { Model } from 'mongoose';
import { ViewSecurity } from '../../api/view/view-security';
import { SqlSecurity } from '../sql/entity/security';

@Injectable()
export class MSecurityQueryRepository implements ISecurityQueryRepository {
  @InjectModel(MongoSecurity.name)
  private securityModel: Model<SecurityDocument>;

  async getAllActiveSessions(userId: string): Promise<ViewSecurity[]> {
    const sessions = await this.securityModel.find({ userId }).select({
      deviceId: 1,
      deviceTitle: 1,
      ipAddress: 1,
      iat: 1,
    });

    return sessions.map((s) => new ViewSecurity(s));
  }

  async getDeviceById(deviceId: string): Promise<SqlSecurity | null> {
    const device = await this.securityModel.findOne({ deviceId });
    console.log(device, 'getDeviceById');
    // @ts-ignore
    return device;
  }
}
