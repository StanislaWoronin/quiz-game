import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from './../src/app.module';
import { createApp } from "../src/helpers/create-app";
import { Factories } from "./helpers/factories";
import { Testing } from "./helpers/request/testing";
import { Questions } from "./helpers/request/questions";
import { CreatedQuestions } from "../src/modules/questions/api/view/created-questions";
import { preparedSuperUser } from "./helpers/prepeared-data/prepared-super-user";
import { preparedQuestions } from "./helpers/prepeared-data/prepared-questions";
import { expectCreatedQuestion } from "./helpers/expect-data/expect-questions";

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(30 * second);

  let app: INestApplication;
  let server;
  let factories: Factories;
  let questions: Questions;
  let testing: Testing;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test
      .createTestingModule({
        imports: [AppModule],
      }).compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();

    factories = new Factories(server);
    questions = new Questions(server);
    testing = new Testing(server)
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Test request', () => {
    it('Clear all data', async () => {
      await testing.clearDb()
    })

    describe('POST -> "sa/quiz/question"', () => {
      it('User without permissions trie to create a question', async () => {
        const request = await questions.createQuestion(preparedSuperUser.notValid, preparedQuestions.valid)
        expect(request.status).toBe(HttpStatus.UNAUTHORIZED)
      })

      it('Try create question with incorrect input data', async () => {
        const errorsMessages = factories.getErrorsMessage(['body'])

        const requestWithLongInputData = await questions.createQuestion(preparedSuperUser.valid, preparedQuestions.notValid.long)
        expect(requestWithLongInputData.status).toBe(HttpStatus.BAD_REQUEST)
        expect(requestWithLongInputData.body).toStrictEqual({ errorsMessages })

        const requestWithShortInputData = await questions.createQuestion(preparedSuperUser.valid, preparedQuestions.notValid.short)
        expect(requestWithShortInputData.status).toBe(HttpStatus.BAD_REQUEST)
        expect(requestWithShortInputData.body).toStrictEqual({ errorsMessages })
      })

      it('Should create question', async () => {
        const requestWithShortInputData = await questions.createQuestion(preparedSuperUser.valid, preparedQuestions.valid)
        expect(requestWithShortInputData.status).toBe(HttpStatus.OK)
        expect(requestWithShortInputData.body).toStrictEqual(expectCreatedQuestion)
      })
    })

    describe('GET -> "sa/quiz/question"', () => {
      it('User without permissions trie to get questions', async () => {

      })
    })
  })
});
