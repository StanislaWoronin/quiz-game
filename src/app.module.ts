import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './modules/sa/questions/api/questions.controller';
import { QuestionsService } from './modules/sa/questions/applications/questions.servise';
import { IQuestionsQueryRepository } from './modules/sa/questions/infrastructure/i-questions-query.repository';
import { IQuestionsRepository } from './modules/sa/questions/infrastructure/i-questions.repository';
import { repositorySwitcher } from './helpers/repositories-switcher/repositories-switcher';
import { settings } from './settings';
import { repositoryName } from './helpers/repositories-switcher/repository-name';
import { ITestingRepository } from "./modules/testing/infrastructure/i-testing.repository";
import { TestingController } from "./modules/testing/api/testing.controller";
import { entity } from "./shared/entity";
import {IUsersRepository} from "./modules/sa/users/infrastructure/i-users.repository";
import {IUsersQueryRepository} from "./modules/sa/users/infrastructure/i-users-query.repository";
import {UsersService} from "./modules/sa/users/applications/users.service";
import {UsersController} from "./modules/sa/questions/api/users.controller";

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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres:admin@localhost:5432/quiz_game',
      // url: 'postgres://Bucktabu:XLwGsHz65uMy@ep-super-cloud-404173.eu-central-1.aws.neon.tech/neondb',
      // process.env.ENV_TYPE === 'local'
      //     ? process.env.POSTGRES_LOCAL_URI
      //     : process.env.POSTGRES_URI,
      autoLoadEntities: true,
      synchronize: true,
      ssl: false,
    }),
    TypeOrmModule.forFeature([...entity]),
  ],
  controllers: [...controllers],
  providers: [...repositories, ...services],
})
export class AppModule {}
