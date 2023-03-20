import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAnswers } from './answerSchema';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from "crypto";
import { CreateQuestionDto } from "../../../api/dto/create-question.dto";

@Schema({ id: false, versionKey: false })
export class MongoQuestion {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, unique: true, type: String })
  body: string;

  @Prop({ type: Boolean, default: false })
  published: boolean;

  @Prop({ required: true, type: String, default: new Date().toISOString })
  createdAt: string;

  @Prop({ required: false, type: String, default: null })
  updatedAt: string | null;

  @Prop({ required: true, type: MongoAnswers })
  correctAnswers: MongoAnswers[];

  constructor(dto: CreateQuestionDto, answers: MongoAnswers[]) {
    this.id = randomUUID()
    this.body = dto.body
    this.correctAnswers = answers
  }
}

export const QuestionSchema = SchemaFactory.createForClass(MongoQuestion);

export type QuestionsDocument = HydratedDocument<MongoQuestion>;
