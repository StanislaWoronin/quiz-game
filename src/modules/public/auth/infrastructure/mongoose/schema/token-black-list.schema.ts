import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ versionKey: false })
export class MongoTokenBlackList {
  @Prop()
  token: string;
}

export const TokenBlackListSchema =
  SchemaFactory.createForClass(MongoTokenBlackList);

export type TokenBlackListDocument = HydratedDocument<MongoTokenBlackList>;
