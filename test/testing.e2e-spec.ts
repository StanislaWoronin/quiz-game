import { INestApplication } from '@nestjs/common';
import { QuestionsFactory } from './helpers/factories/questions-factory';
import { Questions } from './helpers/request/questions';
import { Testing } from './helpers/request/testing';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/config/create-app';
import { Users } from './helpers/request/users';
import { UsersFactory } from './helpers/factories/users-factory';

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(5 * second);

  let app: INestApplication;
  let server;
  let questions: Questions;
  let questionsFactory: QuestionsFactory;
  let users: Users;
  let usersFactory: UsersFactory;
  let testing: Testing;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();

    testing = new Testing(server);
    questions = new Questions(server);
    questionsFactory = new QuestionsFactory(questions);
    users = new Users(server);
    usersFactory = new UsersFactory(users);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/testing/delete-all', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      // createQuestion contains one row in table Questions and tree row in table Answers -> SUM 4 row
      await questionsFactory.createQuestions(1);
      // createAndBanUser contain one row in table Users, one row in Credentials and one row in UserBanInfo -> SUM 3 row
      await usersFactory.crateAndBanUsers(1);

      const rowCount = await testing.getAllRowCount();
      expect(rowCount).toBe(7);

      expect.setState({ rowCount });
    });

    it('Drop all data', async () => {
      const { rowCount } = expect.getState();
      const status = await testing.clearDb();
      expect(status).toBe(204);

      const rowCountAfterClearDb = await testing.getAllRowCount();
      expect(rowCountAfterClearDb).not.toBe(rowCount);
      expect(rowCountAfterClearDb).toBe(0);
    });
  });
});
