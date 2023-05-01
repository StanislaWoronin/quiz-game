import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoQuestion, QuestionsDocument } from './schema/question.schema';
import { Model } from 'mongoose';
import { CreatedQuestions } from '../../api/view/created-questions';
import { UpdateQuestionDto } from '../../api/dto/update-question.dto';
import { CreateQuestionDto } from '../../api/dto/create-question.dto';
import { IQuestionsRepository } from '../i-questions.repository';
import { ObjectId } from 'mongodb';

@Injectable()
export class MQuestionsRepository implements IQuestionsRepository {
  constructor(
    @InjectModel(MongoQuestion.name)
    private questionModel: Model<QuestionsDocument>,
  ) {}

  async createQuestion(
    dto: CreateQuestionDto,
  ): Promise<CreatedQuestions | null> {
    try {
      const question = new MongoQuestion(dto, dto.correctAnswers);
      const createdQuestion = await this.questionModel.create(question);

      return new CreatedQuestions(createdQuestion);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto,
  ): Promise<boolean> {
    const result = await this.questionModel.updateOne(
      { _id: new ObjectId(questionId) },
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
    const result = await this.questionModel.updateOne(
      { _id: new ObjectId(questionId) },
      { $set: { published: published, updatedAt: new Date().toISOString() } },
    );
    return result.matchedCount === 1;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    const result = await this.questionModel.deleteOne({
      _id: new ObjectId(questionId),
    });

    return result.deletedCount === 1;
  }
}
