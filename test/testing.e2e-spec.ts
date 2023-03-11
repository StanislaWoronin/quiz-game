import { INestApplication } from "@nestjs/common";
import { QuestionsFactories } from "./helpers/factories/questions-factories";
import { Questions } from "./helpers/request/questions";
import { Testing } from "./helpers/request/testing";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { createApp } from "../src/common/create-app";
import { preparedSuperUser } from "./helpers/prepeared-data/prepared-super-user";
import { preparedQuestions } from "./helpers/prepeared-data/prepared-questions";
import {Users} from "./helpers/request/users";

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(30 * second);

  let app: INestApplication;
  let server;
  let factories: QuestionsFactories;
  let questions: Questions;
  let testing: Testing;
  let users: Users;

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
    users = new Users(server)

  });

  afterAll(async () => {
    await app.close();
  });

  describe('/testing/delete-all', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      // createQuestion contains one row in table Question and tree row in table Answer -> SUM 4 row
      await questions.createQuestion(preparedSuperUser.valid,preparedQuestions.valid)


      const rowCount = await testing.getAllRowCount()
      expect(rowCount).toBe(4)

      expect.setState({rowCount});
    });

    it('Drop all data', async () => {
      const { rowCount } = expect.getState()
      const status = await testing.clearDb();
      expect(status).toBe(204)

      const rowCountAfterClearDb = await testing.getAllRowCount()
      expect(rowCountAfterClearDb).not.toBe(rowCount)
      expect(rowCountAfterClearDb).toBe(0)
    })
  });
})