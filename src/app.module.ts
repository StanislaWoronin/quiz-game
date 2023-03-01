import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm";
import {QuestionsController} from "./modules/questions/api/questions.controller";

const controllers = [
    QuestionsController
]

const services = [

]

const repositories = [

]

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
          process.env.ENV_TYPE === 'local'
              ? process.env.POSTGRES_LOCAL_URI
              : process.env.POSTGRES_URI,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.ENV_TYPE === 'local' ? false : true,
    }),
    TypeOrmModule.forFeature()
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
