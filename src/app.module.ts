import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './modules/questions/api/questions.controller';
import { QuestionsService } from './modules/questions/applications/questions.servise';
import { IQuestionsQueryRepository } from './modules/questions/infrastructure/i-questions-query.repository';
import { IQuestionsRepository } from './modules/questions/infrastructure/i-questions.repository';
import { repositorySwitcher } from './helpers/repositories-switcher/repositories-switcher';
import { settings } from './settings';
import { repositoryName } from './helpers/repositories-switcher/repository-name';
import { ITestingRepository } from "./modules/testing/infrastructure/i-testing.repository";
import { TestingController } from "./modules/testing/api/testing.controller";
import { entity } from "./shared/entity";

const controllers = [QuestionsController, TestingController];

const services = [QuestionsService];

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
  }
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // url: 'postgresql://postgres:admin@localhost:5432/quiz_game',
      url: 'postgres://Bucktabu:XLwGsHz65uMy@ep-super-cloud-404173.eu-central-1.aws.neon.tech/neondb',
      // process.env.ENV_TYPE === 'local'
      //     ? process.env.POSTGRES_LOCAL_URI
      //     : process.env.POSTGRES_URI,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }),
    TypeOrmModule.forFeature([...entity]),
  ],
  controllers: [...controllers],
  providers: [...repositories, ...services],
})
export class AppModule {}
