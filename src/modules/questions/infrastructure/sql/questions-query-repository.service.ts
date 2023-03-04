import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { QueryParametersDto } from "../../../../shared/pagination/query-parameters/query-parameters.dto";
import { CreatedQuestions } from "../../api/view/created-questions";
import { ViewPage } from "../../../../shared/pagination/view-page";
import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {
  }

  async getAllQuestions(query: QueryParametersDto): Promise<ViewPage<CreatedQuestions>> {
    return {
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: 1,
      pagesCount: Math.ceil(1 / query.pageSize),
      items: [
        {
          id: randomUUID(),
          body: faker.random.alpha(10),
          correctAnswers: [faker.random.alpha(3), faker.random.alpha(4)],
          published: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  }
}