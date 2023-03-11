import { QuestionsRepository } from '../../modules/sa/questions/infrastructure/sql/questions.repository';
import { QuestionsQueryRepository } from '../../modules/sa/questions/infrastructure/sql/questions-query.repository';
import { TestingRepository } from "../../modules/testing/infrastructure/sql/testing.repository";
import {UsersRepository} from "../../modules/sa/users/infrastructure/sql/users.repository";
import {UsersQueryRepository} from "../../modules/sa/users/infrastructure/sql/users-query.repository";

export const repositories = {
  sql: {
    questionsRepository: QuestionsRepository,
    questionsQueryRepository: QuestionsQueryRepository,
    testingRepository: TestingRepository,
    usersRepository: UsersRepository,
    usersQueryRepository: UsersQueryRepository,
  },
  mongo: {},
};
