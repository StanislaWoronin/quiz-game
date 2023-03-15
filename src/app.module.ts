import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './modules/sa/questions/api/questions.controller';
import { QuestionsService } from './modules/sa/questions/applications/questions.servise';
import { IQuestionsQueryRepository } from './modules/sa/questions/infrastructure/i-questions-query.repository';
import { IQuestionsRepository } from './modules/sa/questions/infrastructure/i-questions.repository';
import { repositorySwitcher } from './common/repositories-switcher/repositories-switcher';
import { settings } from './settings';
import { repositoryName } from './common/repositories-switcher/repository-name';
import { ITestingRepository } from "./modules/testing/infrastructure/i-testing.repository";
import { TestingController } from "./modules/testing/api/testing.controller";
import {IUsersRepository} from "./modules/sa/users/infrastructure/i-users.repository";
import {IUsersQueryRepository} from "./modules/sa/users/infrastructure/i-users-query.repository";
import {UsersService} from "./modules/sa/users/applications/users.service";
import {UsersController} from "./modules/sa/users/api/users.controller";
import { SqlAnswers } from "./modules/sa/questions/infrastructure/sql/entity/answers.entity";
import { SqlCredentials } from "./modules/sa/users/infrastructure/sql/entity/credentials.entity";
import { SqlQuestions } from "./modules/sa/questions/infrastructure/sql/entity/questions.entity";
import { SqlUserBanInfo } from "./modules/sa/users/infrastructure/sql/entity/ban-info.entity";
import { SqlUsers } from "./modules/sa/users/infrastructure/sql/entity/users.entity";
import { MongoUsers, UserSchema } from "./modules/sa/users/infrastructure/mongoose/schema/userSchema";
import {
  MongoUserBanInfo,
  UserBanInfoSchema
} from "./modules/sa/users/infrastructure/mongoose/schema/user-ban-info.schema";
import {
  CredentialSchema,
  MongoCredentials
} from "./modules/sa/users/infrastructure/mongoose/schema/credential.schema";
import { AnswerSchema, MongoAnswers } from "./modules/sa/questions/infrastructure/mongoose/schema/answerSchema";
import { MongoQuestion, QuestionSchema } from "./modules/sa/questions/infrastructure/mongoose/schema/question.schema";
import { configSwitcher } from "./common/repositories-switcher/config-switcher";
import {IJwtRepository} from "./modules/public/auth/infrastructure/i-jwt.repository";
import {PairQuizGameController} from "./modules/public/pair-quiz-game/api/pair-quiz-game.controller";
import {PairQuizGameService} from "./modules/public/pair-quiz-game/applications/pair-quiz-game.service";
import {IQuizGameRepository} from "./modules/public/pair-quiz-game/infrastructure/i-quiz-game.repository";
import {set} from "mongoose";

const controllers = [QuestionsController, PairQuizGameController, TestingController, UsersController];

const services = [QuestionsService, PairQuizGameService, UsersService];

const repositories = [
  {
    provide: IQuestionsRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.QuestionsRepository,
    ),
  },
  {
    provide: IQuestionsQueryRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.QuestionsQueryRepository,
    ),
  },
  {
    provide: IQuizGameRepository,
    useClass: repositorySwitcher(
        settings.currentRepository,
        repositoryName.GameRepository
    )
  },
  {
    provide: IJwtRepository,
    useClass: repositorySwitcher(
        settings.currentRepository,
        repositoryName.Jwt,
    ),
  },
  {
    provide: ITestingRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.TestingRepository,
    )
  },
  {
    provide: IUsersRepository,
    useClass: repositorySwitcher(
        settings.currentRepository,
        repositoryName.UsersRepository
    )
  },
  {
    provide: IUsersQueryRepository,
    useClass: repositorySwitcher(
        settings.currentRepository,
        repositoryName.UsersQueryRepository
    )
  }
];

export const entity = [
  SqlAnswers,
  SqlCredentials,
  SqlQuestions,
  SqlUserBanInfo,
  SqlUsers
]

export const mongooseModels = [
  { name: MongoAnswers.name, schema: AnswerSchema },
  { name: MongoQuestion.name, schema: QuestionSchema },
  { name: MongoCredentials.name, schema: CredentialSchema },
  { name: MongoUserBanInfo.name, schema: UserBanInfoSchema },
  { name: MongoUsers.name, schema: UserSchema },
]

@Module({
  imports: [
    ConfigModule.forRoot(),
    ...configSwitcher(settings.currentRepository)
  ],
  controllers: [...controllers],
  providers: [...repositories, ...services],
})
export class AppModule {}
