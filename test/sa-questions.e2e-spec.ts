import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { createApp } from '../src/helpers/create-app';
import { Factories } from './helpers/factories';
import { Testing } from './helpers/request/testing';
import { Questions } from './helpers/request/questions';
import { preparedSuperUser } from './helpers/prepeared-data/prepared-super-user';
import { preparedQuestions } from './helpers/prepeared-data/prepared-questions';
import { expectCreatedQuestion } from './helpers/expect-data/expect-questions';
import { CreatedQuestions } from "../src/modules/questions/api/view/created-questions";
import { preparedQuery } from "./helpers/prepeared-data/prepared-query";

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(30 * second);

  let app: INestApplication;
  let server;
  let factories: Factories;
  let questions: Questions;
  let testing: Testing;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();

    questions = new Questions(server);
    testing = new Testing(server);
    factories = new Factories(questions);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Test request', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    describe('POST -> "sa/quiz/question"', () => {
      it('User without permissions try to create a question', async () => {
        const request = await questions.createQuestion(
          preparedSuperUser.notValid,
          preparedQuestions.valid,
        );
        expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('Try create question with incorrect input data', async () => {
        const errorsMessages = factories.getErrorsMessage(['body']);

        const requestWithLongInputData = await questions.createQuestion(
          preparedSuperUser.valid,
          preparedQuestions.notValid.long,
        );
        expect(requestWithLongInputData.status).toBe(HttpStatus.BAD_REQUEST);
        expect(requestWithLongInputData.body).toStrictEqual({ errorsMessages });

        const requestWithShortInputData = await questions.createQuestion(
          preparedSuperUser.valid,
          preparedQuestions.notValid.short,
        );
        expect(requestWithShortInputData.status).toBe(HttpStatus.BAD_REQUEST);
        expect(requestWithShortInputData.body).toStrictEqual({
          errorsMessages,
        });
      });

      it('Should create question', async () => {
        const requestWithShortInputData = await questions.createQuestion(
          preparedSuperUser.valid,
          preparedQuestions.valid,
        );
        expect(requestWithShortInputData.status).toBe(HttpStatus.OK);
        expect(requestWithShortInputData.body).toStrictEqual(
          expectCreatedQuestion,
        );
      });
    });

    describe('GET -> "sa/quiz/question"', () => {
      it('Clear all data', async () => {
        await testing.clearDb();
      });

      const questionsCount = 10
      it('Create data', async () => {
        const questions = await factories.createQuestions(questionsCount)
      }) // TODO проверить изменеие статуса, а потом изменить статус для части вопросов

      it('User without permissions try to get a question', async () => {
        const request = await questions.getAllQuestions(
          preparedSuperUser.notValid
        );
        expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('Get all question without query', async () => {
        const request = await questions.getAllQuestions(
          preparedSuperUser.valid
        );
        expect(request.status).toBe(HttpStatus.OK);
        expect(request.body.items).toHaveLength(questionsCount)
        expect(request.body.items).toEqual(expect.arrayContaining([CreatedQuestions]))
      })

      it('Get all question with query', async () => {
        const firsRequest = await questions.getAllQuestions(
          preparedSuperUser.valid,
          preparedQuery.published_id_asc_1_3
        );
        expect(firsRequest.status).toBe(HttpStatus.OK);
        expect(firsRequest.body.items).toHaveLength(3)
        expect(firsRequest.body.items).toEqual(expect.arrayContaining([CreatedQuestions]))

        const secondRequest = await questions.getAllQuestions(
          preparedSuperUser.valid,
          preparedQuery.notPublished_body_desc_2_3
        );
        expect(secondRequest.status).toBe(HttpStatus.OK);
        expect(secondRequest.body.items).toHaveLength(2)
        expect(secondRequest.body.items).toEqual(expect.arrayContaining([CreatedQuestions]))
      })

    });
  });
});
