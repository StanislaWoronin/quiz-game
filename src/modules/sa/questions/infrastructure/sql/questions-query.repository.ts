import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {QuestionsQueryDto} from '../../api/dto/query/questions-query.dto';
import {CreatedQuestions} from '../../api/view/created-questions';
import {ViewPage} from '../../../../../common/pagination/view-page';
import {PublishedStatus} from "../../api/dto/query/published-status";

@Injectable()
export class QuestionsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getQuestions(
    queryDto: QuestionsQueryDto,
  ): Promise<ViewPage<CreatedQuestions>> {
    const filter = this.getFilter(queryDto)

    const query = `
      SELECT q.id, q.body, q.published, q."createdAt", q."updatedAt",
             (SELECT ARRAY (SELECT a."correctAnswer" 
                              FROM sql_answers a
                             WHERE a."questionId" = q.id)) AS "correctAnswers"
        FROM sql_questions q
             ${filter}
      ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
      LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};
    `
    const questions = await this.dataSource.query(query)

    const countQuery = ` 
      SELECT COUNT(*)
        FROM sql_questions q
             ${filter} 
    `
    const totalCount = await this.dataSource.query(countQuery)

    return new ViewPage<CreatedQuestions>({
      items: questions ?? [],
      query: queryDto,
      totalCount: Number(totalCount[0].count)
    })
  }

  async questionExists(questionId: string): Promise<boolean | null> {
    const query = `
      SELECT published
        FROM sql_questions
       WHERE id = $1;
    `
    const result = await this.dataSource.query(query, [questionId])

    if (!result.length) {
      return null
    }
    return result[0].published
  }

  private getFilter(query: QuestionsQueryDto): string {
    const { bodySearchTerm, publishedStatus } = query

    let status
    if (publishedStatus === PublishedStatus.Published) status = true
    if (publishedStatus === PublishedStatus.NotPublished) status = false

    if (publishedStatus !== PublishedStatus.All) {
      if (bodySearchTerm) {
        return `WHERE q.published = ${status}
                  AND q.body ILIKE '%${bodySearchTerm}%'`
      }

      return `WHERE q.published = ${status}`
    }
    if (bodySearchTerm) {
      return `WHERE q.body ILIKE '%${bodySearchTerm}%'`
    }

    return ''
  }
}
