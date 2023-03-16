import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ id: false, versionKey: false })
export class MongoCredentials {
  @Prop({ required: true, unique: true, type: String })
  userId: string;

  @Prop({ required: true, type: String })
  credential: string;
}

export const CredentialSchema = SchemaFactory.createForClass(MongoCredentials);

export type CredentialsDocument = HydratedDocument<MongoCredentials>;
