import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QuestionsQueryDto } from '../../api/dto/query/questions-query.dto';
import { CreatedQuestions } from '../../api/view/created-questions';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { PublishedStatus } from '../../api/dto/query/published-status';
import {IQuestionsQueryRepository} from "../i-questions-query.repository";
import {SqlQuestions} from "./entity/questions.entity";

@Injectable()
export class QuestionsQueryRepository implements IQuestionsQueryRepository{
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getQuestions(
    queryDto: QuestionsQueryDto,
  ): Promise<ViewPage<CreatedQuestions>> {
    const filter = this.getFilter(queryDto);

    const query = `
      SELECT q.id, q.body, q.published, q."createdAt", q."updatedAt", q."correctAnswers"
        FROM sql_questions q
             ${filter}
      ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
      LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};
    `;
    console.log(query);
    const questions = await this.dataSource.query(query);

    const countQuery = ` 
      SELECT COUNT(*)
        FROM sql_questions q
             ${filter} 
    `;
    const totalCount = await this.dataSource.query(countQuery);

    return new ViewPage<CreatedQuestions>({
      items: questions ?? [],
      query: queryDto,
      totalCount: Number(totalCount[0].count),
    });
  }

  async getQuestionAnswers(questionId: string): Promise<string[]> {
    const builder = await this.dataSource
        .createQueryBuilder(SqlQuestions, 'q')
        .select('q.correctAnswers')
        .where('q.id = :questionId', {questionId})
    return await builder.getRawOne()
  }

  async questionExists(questionId: string): Promise<boolean | null> {
    const query = `
      SELECT published
        FROM sql_questions
       WHERE id = $1;
    `;
    const result = await this.dataSource.query(query, [questionId]);

    if (!result.length) {
      return null;
    }
    return result[0].published;
  }

  async questionHasAnswer(questionId: string): Promise<string[] | null> {
    const query = `
      SELECT "correctAnswers"
        FROM sql_questions
       WHERE id = $1;
    `;
    const result = await this.dataSource.query(query, [questionId]);

    if (!result.length) {
      return null;
    }
    return result[0].correctAnswers;
  }

  private getFilter(query: QuestionsQueryDto): string {
    const { bodySearchTerm, publishedStatus } = query;

    let status;
    if (publishedStatus === PublishedStatus.Published) status = true;
    if (publishedStatus === PublishedStatus.NotPublished) status = false;

    if (publishedStatus !== PublishedStatus.All) {
      if (bodySearchTerm) {
        return `WHERE q.published = ${status}
                  AND q.body ILIKE '%${bodySearchTerm}%'`;
      }

      return `WHERE q.published = ${status}`;
    }
    if (bodySearchTerm) {
      return `WHERE q.body ILIKE '%${bodySearchTerm}%'`;
    }

    return '';
  }
}
