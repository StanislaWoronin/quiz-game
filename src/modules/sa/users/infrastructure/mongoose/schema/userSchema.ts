import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { MongoUserBanInfo } from "./user-ban-info.schema";

@Schema({ versionKey: false })
export class MongoUsers {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, unique: true, type: String })
  login: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: false, type: MongoUserBanInfo, default: {
      isBanned: false,
      banDate: null,
      banReason: null,
    } })
  banInfo: MongoUserBanInfo;
}

export const UserSchema = SchemaFactory.createForClass(MongoUsers)

export type UsersDocument = HydratedDocument<MongoUsers>