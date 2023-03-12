import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MongoQuestion, QuestionsDocument } from "./schema/question.schema";
import { Model } from "mongoose";

@Injectable()
export class MQuestionsRepository {
  constructor(
    @InjectModel(MongoQuestion.name) private  questionsRepository: Model<QuestionsDocument>
  ) {
  }

}