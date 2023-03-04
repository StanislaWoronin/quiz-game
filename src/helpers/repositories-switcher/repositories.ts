import { QuestionsRepository } from "../../modules/questions/infrastructure/sql/questions.repository";
import { QuestionsQueryRepository } from "../../modules/questions/infrastructure/sql/questions-query-repository.service";

export const repositories = {
  sql: {
    questionsRepository: QuestionsRepository,
    questionsQueryRepository: QuestionsQueryRepository
  },
  mongo: {

  }
}