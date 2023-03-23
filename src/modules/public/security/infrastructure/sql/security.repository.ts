import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {SqlSecurity} from "./entity/security";
import {ISecurityRepository} from "../i-security.repository";

@Injectable()
export class SecurityRepository implements ISecurityRepository{
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUserDevice(newDevice: SqlSecurity): Promise<boolean> {
    try {
      await this.dataSource.getRepository(SqlSecurity).save(newDevice);

      return true;
    } catch (e) {
      return false;
    }
  }

  async updateCurrentActiveSessions(
    deviceId: string,
    iat: string,
    exp: string,
  ): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(SqlSecurity)
      .set({
        iat,
        exp,
      })
      .where('deviceId = :id', { id: deviceId })
      .execute();

    if (result.affected != 1) {
      return false;
    }
    return true;
  }

  async deleteAllActiveSessions(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    console.log(userId, deviceId);
    const builder = this.dataSource
      .createQueryBuilder()
      .delete()
      .from(SqlSecurity)
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId });
    const result = await builder.execute();

    return true;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(SqlSecurity)
      .where('deviceId = :id', { id: deviceId })
      .execute();

    if (result.affected != 1) {
      return false;
    }
    return true;
  }
}
