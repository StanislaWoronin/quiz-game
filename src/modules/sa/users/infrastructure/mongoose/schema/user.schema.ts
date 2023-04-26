import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MongoUserBanInfo } from './user-ban-info.schema';
import { MongoEmailConfirmation } from './email-confirmation.schema';
import { CreateUserDto } from '../../../api/dto/create-user.dto';
import { EmailConfirmationDto } from '../../../applications/dto/email-confirmation.dto';

@Schema({ versionKey: false })
export class MongoUsers {
  @Prop({ required: true, unique: true, type: String })
  login: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String, default: new Date().toISOString })
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

  constructor(
    userDto: CreateUserDto,
    password: string,
    emailConfirmationDto: EmailConfirmationDto,
  ) {
    this.login = userDto.login;
    this.email = userDto.email;
    this.password = password;
    this.emailConfirmation.confirmationCode =
      emailConfirmationDto.confirmationCode;
    this.emailConfirmation.expirationDate = emailConfirmationDto.expirationDate;
    this.emailConfirmation.isConfirmed = emailConfirmationDto.isConfirmed;
  }
}

export const UserSchema = SchemaFactory.createForClass(MongoUsers);

export type UsersDocument = HydratedDocument<MongoUsers>;
