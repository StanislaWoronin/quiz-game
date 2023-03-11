import { Module } from '@nestjs/common';
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
import { Answers } from "./modules/sa/questions/infrastructure/sql/entity/answers.entity";
import { Credentials } from "./modules/sa/users/infrastructure/sql/entity/credentials.entity";
import { Questions } from "./modules/sa/questions/infrastructure/sql/entity/questions.entity";
import { UserBanInfo } from "./modules/sa/users/infrastructure/sql/entity/ban-info.entity";
import { Users } from "./modules/sa/users/infrastructure/sql/entity/users.entity";
import { TypeOrmConfig } from "./common/type-orm.config";

const controllers = [QuestionsController, TestingController, UsersController];

const services = [QuestionsService, UsersService];

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

const entity = [
  Answers,
  Credentials,
  Questions,
  UserBanInfo,
  Users
]

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfig, extraProviders: [ConfigService]} ),
    TypeOrmModule.forFeature([...entity]),
  ],
  controllers: [...controllers],
  providers: [...repositories, ...services],
})
export class AppModule {}
