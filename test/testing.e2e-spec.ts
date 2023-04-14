import { INestApplication } from '@nestjs/common';
import { QuestionsFactory } from './helpers/factories/questions-factory';
import { Questions } from './helpers/request/questions';
import { Testing } from './helpers/request/testing';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/config/create-app';
import { Users } from './helpers/request/users';
import { UsersFactory } from './helpers/factories/users-factory';
import { Auth } from './helpers/request/auth';
import { Game } from './helpers/request/game';
import { GameFactory } from './helpers/factories/game-factory';
import { preparedGameData } from './helpers/prepeared-data/prepared-game-data';

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(5 * second);

  let app: INestApplication;
  let server;
  let auth: Auth;
  let questionsFactories: QuestionsFactory;
  let questions: Questions;
  let game: Game;
  let gameFactory: GameFactory;
  let testing: Testing;
  let users: Users;
  let usersFactory: UsersFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();

    auth = new Auth(server);
    questions = new Questions(server);
    questionsFactories = new QuestionsFactory(questions);
    game = new Game(server);
    testing = new Testing(server);
    users = new Users(server);
    usersFactory = new UsersFactory(users, auth);
    gameFactory = new GameFactory(game, usersFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/testing/delete-all', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      await questionsFactories.createQuestions(1);
      await usersFactory.crateAndBanUsers(1);
      const [fistUser, secondUser] = await usersFactory.createAndLoginUsers(
        2,
        2,
      );
      await questionsFactories.createQuestions(
        preparedGameData.length,
        preparedGameData,
      );
      await gameFactory.createFinishedGame({
        first: fistUser,
        second: secondUser,
      });

      const rowCount = await testing.getAllRowCount();
      expect(rowCount).not.toBe(0);

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
