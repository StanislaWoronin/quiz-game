import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MongoQuestion, QuestionsDocument } from './schema/question.schema';
import { Connection, Model } from 'mongoose';
import { CreatedQuestions } from '../../api/view/created-questions';
import { UpdateQuestionDto } from '../../api/dto/update-question.dto';
import { CreateQuestionDto } from "../../api/dto/create-question.dto";
import { MongoAnswers } from "./schema/answerSchema";

@Injectable()
export class MQuestionsRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MongoQuestion.name)
    private questionsRepository: Model<QuestionsDocument>,
  ) {}

  async createQuestion(
    dto: CreateQuestionDto,
  ): Promise<CreatedQuestions | null> {
    const answers = dto.correctAnswers.map(el => new MongoAnswers(el))
    const question = new MongoQuestion(dto, answers)
    await this.questionsRepository.create(question)

    return new CreatedQuestions(question);
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto,
  ): Promise<boolean> {
    const result = await this.questionsRepository.updateOne(
      { id: questionId },
      {
        $set: {
          body: dto.body,
          correctAnswers: dto.correctAnswers,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    return result.matchedCount === 1;
  }

  async updatePublishStatus(
    questionId: string,
    published: boolean,
  ): Promise<boolean> {
    const result = await this.questionsRepository.updateOne(
      { id: questionId, correctAnswers: { $exists: true } },
      { published, updatedAt: new Date().toISOString() },
    );

    return result.matchedCount === 1;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    const result = await this.questionsRepository.deleteOne({ id: questionId });

    return result.deletedCount === 1;
  }
}
