import { INestApplication } from "@nestjs/common";
import { Factories } from "./helpers/factories";
import { Questions } from "./helpers/request/questions";
import { Testing } from "./helpers/request/testing";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { createApp } from "../src/helpers/create-app";

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

  describe('/testing/delete-all', () => {
    it('Clear all data', async () => {
      const status = await testing.clearDb();
      expect(status).toBe(204)
    });
  });
})