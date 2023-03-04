import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm";
import {QuestionsController} from "./modules/questions/api/questions.controller";
import { QuestionsService } from "./modules/questions/applications/questions.servise";
import { IQuestionsQueryRepository } from "./modules/questions/infrastructure/i-questions-query.repository";
import { IQuestionsRepository } from "./modules/questions/infrastructure/i-questions.repository";
import { repositorySwitcher } from "./helpers/repositories-switcher/repositories-switcher";
import { settings } from "./settings";
import { repositoryName } from "./helpers/repositories-switcher/repository-name";

const controllers = [
    QuestionsController
]

const services = [
  QuestionsService
]

const repositories = [
  {
    provide: IQuestionsRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.QuestionsRepository
    )
  },
  {
    provide: IQuestionsQueryRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.QuestionsQueryRepository
    )
  }
]

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres:admin@localhost:5432/quiz_game',
          // process.env.ENV_TYPE === 'local'
          //     ? process.env.POSTGRES_LOCAL_URI
          //     : process.env.POSTGRES_URI,
      autoLoadEntities: true,
      synchronize: true,
      ssl: false
    }),
    TypeOrmModule.forFeature()
  ],
  controllers: [ ...controllers ],
  providers: [ ...repositories, ...services ]
})
export class AppModule {}
