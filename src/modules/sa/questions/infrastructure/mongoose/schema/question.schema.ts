import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MongoAnswers } from "./answerSchema";
import { HydratedDocument } from "mongoose";

@Schema({ id: false, versionKey: false })
export class MongoQuestion {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, unique: true, type: String })
  body: string;

  @Prop({ type: Boolean, default: false })
  published: boolean;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: false, type: String, default: null })
  updatedAt: string | null;

  @Prop({ required: true, type: MongoAnswers })
  correctAnswers: MongoAnswers;
}

export const QuestionSchema = SchemaFactory.createForClass(MongoQuestion)

export type QuestionsDocument = HydratedDocument<MongoQuestion>