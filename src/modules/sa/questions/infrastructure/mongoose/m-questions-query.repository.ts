import { ViewQuestion } from './../../api/view/view-question';
import { ViewPage } from './../../../../../common/pagination/view-page';
import { PublishedStatus } from './../../api/dto/query/published-status';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoQuestion, QuestionsDocument } from './schema/question.schema';
import { isValidObjectId, Model } from 'mongoose';
import { QuestionsQueryDto } from '../../api/dto/query/questions-query.dto';
import { IQuestionsQueryRepository } from '../i-questions-query.repository';
import { ObjectId } from 'mongodb';

@Injectable()
export class MQuestionsQueryRepository implements IQuestionsQueryRepository {
  constructor(
    @InjectModel(MongoQuestion.name)
    private questionsRepository: Model<QuestionsDocument>,
  ) {}

  async getQuestions(
    query: QuestionsQueryDto,
  ): Promise<ViewPage<ViewQuestion>> {
    const filter = this.getFilter(query);

    const questions = await this.questionsRepository.aggregate([
      { $match: { $and: filter } },
      { $sort: { [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 } },
      { $skip: query.skip },
      { $limit: query.pageSize },
      { $project: { __v: false } },
    ]);
    const items = questions.map((q) => new ViewQuestion(q));
    const totalCount = await this.questionsRepository.countDocuments({
      $and: filter,
    });

    return new ViewPage<ViewQuestion>({
      items: items,
      query,
      totalCount,
    });
  }

  async getQuestionAnswers(questionId: string): Promise<string[]> {
    const answers = await this.questionsRepository
      .findOne({ _id: new ObjectId(questionId) })
      .select({ correctAnswers: 1 });
    console.log(answers, 'getQuestionAnswers');
    // @ts-ignore
    return answers;
  }

  async questionExists(questionId: string): Promise<boolean> {
    try {
      console.log('here');
      const isExist = await this.questionsRepository.exists({
        _id: new ObjectId(questionId),
      });
      console.log(isExist, 'questionExists');
      // @ts-ignore
      return isExist;
    } catch (e) {
      console.log(e);
    }
  }

  async questionHasAnswer(questionId: string): Promise<string[] | null> {
    try {
      if (!isValidObjectId(questionId)) {
        return null;
      }
      const result = await this.questionsRepository
        .findOne({
          _id: new ObjectId(questionId),
        })
        .select({ _id: 0, correctAnswers: 1 });

      if (!result) {
        return null;
      }
      return result.correctAnswers;
    } catch (e) {
      console.log(e);
    }
  }

  private getFilter(query: QuestionsQueryDto) {
    const { bodySearchTerm, publishedStatus } = query;

    const filter = [];
    if (publishedStatus != PublishedStatus.All) {
      filter.push(this.getPublishedFilter(publishedStatus));
    }

    filter.push({ body: { $regex: bodySearchTerm ?? '', $optional: 'i' } });

    return filter;
  }

  private getPublishedFilter(published) {
    if (published === PublishedStatus.Published) {
      return { published: true };
    }
    return { published: false };
  }
}
