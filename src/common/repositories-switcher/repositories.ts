import { QuestionsRepository } from '../../modules/sa/questions/infrastructure/sql/questions.repository';
import { QuestionsQueryRepository } from '../../modules/sa/questions/infrastructure/sql/questions-query.repository';
import { TestingRepository } from "../../modules/testing/infrastructure/sql/testing.repository";
import {UsersRepository} from "../../modules/sa/users/infrastructure/sql/users.repository";
import {UsersQueryRepository} from "../../modules/sa/users/infrastructure/sql/users-query.repository";
import { MUsersRepository } from "../../modules/sa/users/infrastructure/mongoose/m-users.repository";
import { MUsersQueryRepository } from "../../modules/sa/users/infrastructure/mongoose/m-users-query.repository";
import { MTestingRepository } from "../../modules/testing/infrastructure/mongoose/m-testing.repository";
import {
  MQuestionsQueryRepository
} from "../../modules/sa/questions/infrastructure/mongoose/m-questions-query.repository";
import { MQuestionsRepository } from "../../modules/sa/questions/infrastructure/mongoose/m-questions.repository";
import {QuizGameRepository} from "../../modules/public/pair-quiz-game/infrastructure/sql/quiz-game.repository";

export const repositories = {
  sql: {
    gameRepository: QuizGameRepository,
    questionsRepository: QuestionsRepository,
    questionsQueryRepository: QuestionsQueryRepository,
    testingRepository: TestingRepository,
    usersRepository: UsersRepository,
    usersQueryRepository: UsersQueryRepository,
  },
  mongo: {
    questionsRepository: MQuestionsRepository,
    questionsQueryRepository: MQuestionsQueryRepository,
    testingRepository: MTestingRepository,
    usersRepository: MUsersRepository,
    usersQueryRepository: MUsersQueryRepository,
  },
};
