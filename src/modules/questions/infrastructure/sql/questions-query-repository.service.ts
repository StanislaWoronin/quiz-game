import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryParametersDto } from '../../../../shared/pagination/query-parameters/query-parameters.dto';
import { CreatedQuestions } from '../../api/view/created-questions';
import { ViewPage } from '../../../../shared/pagination/view-page';
import {giveSkipNumber} from "../../../../shared/pagination/query-parameters/helpers";
import {PublishedStatus} from "../../../../shared/pagination/query-parameters/published-status";

@Injectable()
export class QuestionsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllQuestions(
    queryDto: QueryParametersDto,
  ): Promise<ViewPage<CreatedQuestions>> {
    const filter = this.getFilter(queryDto)

    const query = `
      SELECT q.id, q.body, q.published, q."createdAt", q."updatedAt", a."correctAnswer"
        FROM questions q
        LEFT JOIN answers a
          ON a."questionId" = q.id
             ${filter}
       ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
       LIMIT ${queryDto.pageSize} OFFSET ${giveSkipNumber(
           queryDto.pageNumber,
           queryDto.pageSize,
         )};
    `

    // const query = `
    //   SELECT q.id, q.body, q.published, q."createdAt", q."updatedAt",
    //          (SELECT ARRAY (SELECT a."correctAnswer" FROM answers a
    //            WHERE a."questionId" = q.id)) AS "correctAnswers"
    //     FROM questions q
    //          ${filter}
    //   ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
    //   LIMIT ${queryDto.pageSize} OFFSET ${giveSkipNumber(
    //     queryDto.pageNumber,
    //     queryDto.pageSize,
    //   )};
    // `
    console.log(query)
    const questions = await this.dataSource.query(query)
    console.log(questions)
    //const items = questions.map(q => toViewQuesion(q))
    const countQuery = ` 
      SELECT COUNT(id)
        FROM questions
             ${filter} 
    `
    console.log(countQuery)
    const totalCount = await this.dataSource.query(countQuery)
    return
    //return new ViewPage<CreatedQuestions>({items, queryDto, totalCount})
  }

  private getFilter(query: QueryParametersDto): string {
    const { bodySearchTerm, publishedStatus } = expect.getState()

    let status
    if (publishedStatus === PublishedStatus.Published) status = true
    if (publishedStatus === PublishedStatus.NotPublished) status = false

    if (bodySearchTerm && publishedStatus !== PublishedStatus.All) {
      return `WHERE q.published = ${status}
                AND q.body ILIKE '%${bodySearchTerm}%'`
    }
    if (publishedStatus) {
      return `WHERE q.published = ${status}`
    }
    if (bodySearchTerm) {
      return `AND q.body ILIKE '%${bodySearchTerm}%'`
    }
    return ''
  }
}
