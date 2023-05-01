import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SqlSecurity } from '../../sql/entity/security';

@Schema({ versionKey: false })
export class MongoSecurity {
  @Prop()
  userId: string;

  @Prop()
  deviceId: string;

  @Prop()
  deviceTitle: string;

  @Prop()
  ipAddress: string;

  @Prop()
  iat: string;

  @Prop()
  exp: string;

  constructor(device: SqlSecurity) {
    this.userId = device.userId;
    this.deviceId = device.deviceId;
    this.deviceTitle = device.deviceTitle;
    this.ipAddress = device.ipAddress;
    this.iat = device.iat;
    this.exp = device.exp;
  }
}

export const SecuritySchema = SchemaFactory.createForClass(MongoSecurity);

export type SecurityDocument = HydratedDocument<MongoSecurity>;
