import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MongoUserBanInfo } from './user-ban-info.schema';
import { MongoEmailConfirmation } from './email-confirmation.schema';
import { CreateUserDto } from '../../../api/dto/create-user.dto';
import { EmailConfirmationDto } from '../../../applications/dto/email-confirmation.dto';
import { ViewUserStatistic } from '../../../../../public/pair-quiz-game/api/view/view-user-statistic';
import { ApiProperty } from '@nestjs/swagger';
import { Statistic } from './statistic.type';

@Schema({ versionKey: false })
export class MongoUsers {
  @Prop({ required: true, unique: true, type: String })
  login: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({
    required: true,
    type: String,
    timestamps: true,
    // default: new Date().toISOString TODO try create default ISODate
  })
  createdAt: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({
    required: true,
    type: MongoUserBanInfo,
    default: {
      isBanned: false,
      banDate: null,
      banReason: null,
    },
  })
  banInfo: MongoUserBanInfo;

  @Prop({
    required: true,
    type: MongoEmailConfirmation,
  })
  emailConfirmation: MongoEmailConfirmation;

  @Prop({
    type: Statistic,
    default: new Statistic(),
  })
  statistic: Statistic;

  constructor(
    userDto: CreateUserDto,
    password: string,
    emailConfirmationDto: EmailConfirmationDto,
  ) {
    this.login = userDto.login;
    this.email = userDto.email;
    this.password = password;
    this.createdAt = new Date().toISOString()
    this.emailConfirmation = emailConfirmationDto as MongoEmailConfirmation
  }
}

export const UserSchema = SchemaFactory.createForClass(MongoUsers);

export type UsersDocument = HydratedDocument<MongoUsers>;
