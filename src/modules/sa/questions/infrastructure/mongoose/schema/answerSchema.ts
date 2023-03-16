import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ id: false, versionKey: false })
export class MongoAnswers {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  correctAnswer: string;
}

export const AnswerSchema = SchemaFactory.createForClass(MongoAnswers);

export type AnswersDocument = HydratedDocument<MongoAnswers>;
