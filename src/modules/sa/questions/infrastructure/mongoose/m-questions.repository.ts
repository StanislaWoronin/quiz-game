import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MongoQuestion, QuestionsDocument } from './schema/question.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { NewQuestionDto } from '../../applications/dto/new-question.dto';
import { CreatedQuestions } from '../../api/view/created-questions';
import { randomUUID } from 'crypto';
import { UpdateQuestionDto } from '../../api/dto/update-question.dto';

@Injectable()
export class MQuestionsRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MongoQuestion.name)
    private questionsRepository: Model<QuestionsDocument>,
  ) {}

  async createQuestion(
    newQuestion: NewQuestionDto,
    answers: string[],
  ): Promise<CreatedQuestions | null> {
    const question = { id: randomUUID(), ...newQuestion, answers };
    console.log(question);
    return new CreatedQuestions(question.id, newQuestion, answers);
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
