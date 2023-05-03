import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false, versionKey: false })
export class MongoEmailConfirmation {
  @Prop({ required: false, type: String, default: null })
  confirmationCode: string;

  @Prop({ required: false, type: String, default: null })
  expirationDate: string;

  @Prop({ required: false, type: Boolean, default: false })
  isConfirmed: boolean;
}

// export const EmailConfirmationSchema = SchemaFactory.createForClass(
//   MongoEmailConfirmation,
// );
//
// export type EmailConfirmationDocument =
//   HydratedDocument<MongoEmailConfirmation>;
