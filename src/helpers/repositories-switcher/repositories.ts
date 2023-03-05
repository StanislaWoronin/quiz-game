import { QuestionsRepository } from '../../modules/questions/infrastructure/sql/questions.repository';
import { QuestionsQueryRepository } from '../../modules/questions/infrastructure/sql/questions-query-repository.service';
import { TestingRepository } from "../../modules/testing/infrastructure/sql/testing.repository";

export const repositories = {
  sql: {
    questionsRepository: QuestionsRepository,
    questionsQueryRepository: QuestionsQueryRepository,
    testingRepository: TestingRepository
  },
  mongo: {},
};
