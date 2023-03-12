import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ _id: false, versionKey: false })
export class MongoUserBanInfo {
  @Prop({ required: false, type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ required: false, type: String, default: null})
  banDate: string;

  @Prop({ required: false, type: String, default: null })
  banReason: string;
}

export const UserBanInfoSchema = SchemaFactory.createForClass(MongoUserBanInfo)

export type UserBanInfoDocument = HydratedDocument<MongoUserBanInfo>