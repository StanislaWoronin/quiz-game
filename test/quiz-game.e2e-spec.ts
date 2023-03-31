import {HttpStatus, INestApplication} from '@nestjs/common';
import {QuestionsFactory} from './helpers/factories/questions-factory';
import {Questions} from './helpers/request/questions';
import {Testing} from './helpers/request/testing';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../src/app.module';
import {createApp} from '../src/config/create-app';
import {Game} from './helpers/request/game';
import {Users} from './helpers/request/users';
import {UsersFactory} from './helpers/factories/users-factory';
import {Auth} from './helpers/request/auth';
import {expectAnswer, expectPlayerProgress, expectQuestions, expectViewGame,} from './helpers/expect-data/expect-game';
import {GameStatus} from '../src/modules/public/pair-quiz-game/shared/game-status';
import {preparedAnswer} from './helpers/prepeared-data/prepared-answer';
import {AnswerStatus} from '../src/modules/public/pair-quiz-game/shared/answer-status';
import {preparedGameData} from './helpers/prepeared-data/prepared-game-data';
import {GameFactory} from './helpers/factories/game-factory';
import {randomUUID} from 'crypto';
import {faker} from '@faker-js/faker';

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
    gameFactory = new GameFactory(game, usersFactory);
    testing = new Testing(server);
    users = new Users(server);
    usersFactory = new UsersFactory(users, auth);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(
    'POST -> "pair-game-quiz/pair/connection".' +
      'Connect current user to existing random pending pair or create' +
      'new pair which will be waiting second player',
    () => {
      it('Clear data base', async () => {
        await testing.clearDb();
      });

      it('Create data', async () => {
        const [firstUser, secondUser] = await usersFactory.createAndLoginUsers(
          2,
        );
        const questions = await questionsFactories.createQuestions(10);

        expect.setState({
          firstUser,
          secondUser,
          questions,
        });
      });

      it('Shouldn`t join into the game, if user is Unauthorized', async () => {
        const response = await game.joinGame();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('User create new pair quiz-game', async () => {
        const { firstUser } = expect.getState();

        const createdGame = await game.joinGame(firstUser.accessToken);
        expect(createdGame.status).toBe(HttpStatus.OK);
        expect(createdGame.body).toStrictEqual(
          expectViewGame(
            { first: expectPlayerProgress(firstUser.user, {}) },
            GameStatus.PendingSecondPlayer,
          ),
        );

        const getGame = await game.getMyCurrentGame(firstUser.accessToken);
        const getGameById = await game.getGameById(
          createdGame.body.id,
          firstUser.accessToken,
        );
        expect(createdGame.body).toStrictEqual(getGame.body);
        expect(createdGame.body).toStrictEqual(getGameById.body);
      });

      it('1 - Shouldn`t join into the game, if user already has active game', async () => {
        const { firstUser } = expect.getState();

        const response = await game.joinGame(firstUser.accessToken);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });

      it('User join into active game', async () => {
        const { firstUser, secondUser, questions } = expect.getState();

        const response = await game.joinGame(secondUser.accessToken);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectViewGame(
            {
              first: expectPlayerProgress(firstUser.user, {}),
              second: expectPlayerProgress(secondUser.user, {}),
            },
            GameStatus.Active,
            expectQuestions(questions),
          ),
        );
      });

      it('2 - Shouldn`t join into the game, if user already has active game', async () => {
        const { firstUser } = expect.getState();

        const response = await game.joinGame(firstUser.accessToken);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });

      it('3 - Shouldn`t join into the game, if user already has active game', async () => {
        const { secondUser } = expect.getState();

        const response = await game.joinGame(secondUser.accessToken);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
    },
  );

  describe(
    'POST -> "pair-game-quiz/pair/my-current/answers"' +
      'Send answer for next not answered questions in active pair',
    () => {
      it('Clear data base', async () => {
        await testing.clearDb();
      });

      it('Create data', async () => {
        const [firstUser, secondUser, thirdUser] =
          await usersFactory.createAndLoginUsers(3);
        await questionsFactories.createQuestions(
          preparedGameData.length,
          preparedGameData,
        );
        await game.joinGame(firstUser.accessToken);
        const createdGame = await game.joinGame(secondUser.accessToken);

        expect.setState({
          firstUser,
          secondUser,
          thirdUser,
          questions: createdGame.body.questions,
        });
      });

      it('Shouldn`t send answer, if he is unauthorized', async () => {
        const response = await game.sendAnswer(preparedAnswer.random);
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('Should send answer', async () => {
        const { firstUser } = expect.getState();

        const response = await game.sendAnswer(
          preparedAnswer.random,
          firstUser.accessToken,
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectAnswer(AnswerStatus.Incorrect),
        );
      });

      it('The user can`t send a response if he is not in an active pair', async () => {
        const { thirdUser } = expect.getState();

        const thirdUserAnswered = await game.sendAnswer(
          preparedAnswer.random,
          thirdUser.accessToken,
        );
        expect(thirdUserAnswered.status).toBe(HttpStatus.FORBIDDEN);
      });

      it(
        'The user can`t send a response if he has already answered on' +
          ' all questions',
        async () => {
          const { secondUser, questions } = expect.getState();

          await gameFactory.sendManyAnswer(secondUser.accessToken, questions, {
            1: AnswerStatus.Incorrect,
            2: AnswerStatus.Incorrect,
            3: AnswerStatus.Incorrect,
            4: AnswerStatus.Incorrect,
            5: AnswerStatus.Incorrect,
          });
          const response = await game.sendAnswer(
            preparedAnswer.random,
            secondUser.accessToken,
          );
          expect(response.status).toBe(HttpStatus.FORBIDDEN);
        },
      );
    },
  );

  describe('GET -> "pair-game-quiz/pair/:gameId"', () => {
    it('Clear data base', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const [firstUser, secondUser, thirdUser] =
        await usersFactory.createAndLoginUsers(3);

      await questionsFactories.createQuestions(
        preparedGameData.length,
        preparedGameData,
      );
      await game.joinGame(firstUser.accessToken);
      const createdGame = await game.joinGame(secondUser.accessToken);

      expect.setState({
        firstUser,
        secondUser,
        thirdUser,
        gameId: createdGame.body.id,
        questions: createdGame.body.questions,
      });
    });

    it('Shouldn`t return game if specifical id not found', async () => {
      const { firstUser } = expect.getState();
      const randomId = randomUUID();

      const response = await game.getGameById(randomId, firstUser.accessToken);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(
      'Shouldn`t return game if user tries to get pair in which user ' +
        'is not participant',
      async () => {
        const { thirdUser, gameId } = expect.getState();

        const response = await game.getGameById(gameId, thirdUser.accessToken);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      },
    );

    it('Shouldn`t return game, if he is unauthorized', async () => {
      const { gameId } = expect.getState();

      const response = await game.getGameById(gameId);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Shouldn`t return game, if id has invalid format', async () => {
      const { firstUser } = expect.getState();
      const invalidId = Date.now();

      const response = await game.getGameById(
        invalidId.toString(),
        firstUser.accessToken,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('Should return "Active" game', async () => {
      const { firstUser, secondUser, gameId, questions } = expect.getState();

      const response = await game.getGameById(gameId, firstUser.accessToken);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(firstUser.user, {}),
            second: expectPlayerProgress(secondUser.user, {}),
          },
          GameStatus.Active,
          expectQuestions(questions),
        ),
      );
    });

    it('Should return "PendingSecondPlayer" game', async () => {
      const { thirdUser } = expect.getState();

      const createdGame = await game.joinGame(thirdUser.accessToken);
      const response = await game.getGameById(
        createdGame.body.id,
        thirdUser.accessToken,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(thirdUser.user, {}),
          },
          GameStatus.PendingSecondPlayer,
        ),
      );
    });

    it('Should return "Finished" game', async () => {
      const { firstUser, secondUser, gameId, questions } = expect.getState();

      await gameFactory.sendManyAnswer(firstUser.accessToken, questions, {
        1: AnswerStatus.Incorrect,
        2: AnswerStatus.Correct,
        3: AnswerStatus.Incorrect,
        4: AnswerStatus.Incorrect,
        5: AnswerStatus.Incorrect,
      });

      await gameFactory.sendManyAnswer(secondUser.accessToken, questions, {
        1: AnswerStatus.Incorrect,
        2: AnswerStatus.Incorrect,
        3: AnswerStatus.Incorrect,
        4: AnswerStatus.Correct,
        5: AnswerStatus.Incorrect,
      });

      const response = await game.getGameById(gameId, firstUser.accessToken);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(
              firstUser.user,
              {
                1: AnswerStatus.Incorrect,
                2: AnswerStatus.Correct,
                3: AnswerStatus.Incorrect,
                4: AnswerStatus.Incorrect,
                5: AnswerStatus.Incorrect,
              },
              2,
            ),
            second: expectPlayerProgress(
              secondUser.user,
              {
                1: AnswerStatus.Incorrect,
                2: AnswerStatus.Incorrect,
                3: AnswerStatus.Incorrect,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Incorrect,
              },
              1,
            ),
          },
          GameStatus.Finished,
          expectQuestions(questions),
        ),
      );
    });
  });

  describe(
    'GET -> "pair-game-quiz/pair/my-current"' +
      'Return current unfinished user game',
    () => {
      it('Clear data base', async () => {
        await testing.clearDb();
      });

      it('Create data', async () => {
        const [firstUser, secondUser, thirdUser] =
          await usersFactory.createAndLoginUsers(3);
        await questionsFactories.createQuestions(
          preparedGameData.length,
          preparedGameData,
        );
        await game.joinGame(firstUser.accessToken);
        const createdGame = await game.joinGame(secondUser.accessToken);

        expect.setState({
          firstUser,
          secondUser,
          thirdUser,
          gameId: createdGame.body.id,
          questions: createdGame.body.questions,
        });
      });

      it('Shouldn`t return game if user don`t has active pair', async () => {
        const { thirdUser } = expect.getState();

        const response = await game.getMyCurrentGame(thirdUser.accessToken);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it('Shouldn`t return game, if he is unauthorized', async () => {
        const response = await game.getMyCurrentGame();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('Should return game', async () => {
        const { firstUser, secondUser, questions } = expect.getState();

        const response = await game.getMyCurrentGame(firstUser.accessToken);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectViewGame(
            {
              first: expectPlayerProgress(firstUser.user, {}),
              second: expectPlayerProgress(secondUser.user, {}),
            },
            GameStatus.Active,
            expectQuestions(questions),
          ),
        );
      });

      it('Shouldn`t return the game if the game has been completed', async () => {
        const { firstUser, secondUser, questions } = expect.getState();

        await gameFactory.sendManyAnswer(firstUser.accessToken, questions, {
          1: AnswerStatus.Incorrect,
          2: AnswerStatus.Incorrect,
          3: AnswerStatus.Incorrect,
          4: AnswerStatus.Incorrect,
          5: AnswerStatus.Incorrect,
        });

        await gameFactory.sendManyAnswer(secondUser.accessToken, questions, {
          1: AnswerStatus.Incorrect,
          2: AnswerStatus.Incorrect,
          3: AnswerStatus.Incorrect,
          4: AnswerStatus.Incorrect,
          5: AnswerStatus.Incorrect,
        });

        const response = await game.getMyCurrentGame(firstUser.accessToken);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
    },
  );

  describe('Scoring test', () => {
    describe(
      'First and second players take turns answering questions. Both players score' +
        'the same number of points, but the first one wins because he was the first',
      () => {
        it('Clear data base', async () => {
          await testing.clearDb();
        });

        it('Create data', async () => {
          const [firstUser, secondUser] =
            await usersFactory.createAndLoginUsers(2);
          await questionsFactories.createQuestions(
            preparedGameData.length,
            preparedGameData,
          );
          await game.joinGame(firstUser.accessToken);
          const createdGame = await game.joinGame(secondUser.accessToken);

          expect.setState({
            firstUser,
            secondUser,
            gameId: createdGame.body.id,
            questions: createdGame.body.questions,
          });
        });

        it('1 - First player send incorrect answer for first questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await game.sendAnswer(faker.random.alpha(5), firstUser.accessToken);
          const response = await game.getMyCurrentGame(firstUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(firstUser.user, {
                  1: AnswerStatus.Incorrect,
                }),
                second: expectPlayerProgress(secondUser.user, {}),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('2 - Second player send correct answer for first questions', async () => {
          const { firstUser, secondUser, gameId, questions } =
            expect.getState();

          await gameFactory.sendCorrectAnswer(
            secondUser.accessToken,
            questions[0],
          );
          const response = await game.getGameById(
            gameId,
            firstUser.accessToken,
          );
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(firstUser.user, {
                  1: AnswerStatus.Incorrect,
                }),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                  },
                  1,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('3 - First player send correct answer for second questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await gameFactory.sendCorrectAnswer(
            firstUser.accessToken,
            questions[1],
          );
          const response = await game.getMyCurrentGame(firstUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                  },
                  1,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                  },
                  1,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('4 - Second player send incorrect answer for second questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await game.sendAnswer(faker.random.alpha(5), secondUser.accessToken);
          const response = await game.getMyCurrentGame(secondUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                  },
                  1,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                  },
                  1,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('5 - First player send correct th for third questions', async () => {
          const { firstUser, secondUser, gameId, questions } =
            expect.getState();

          await gameFactory.sendCorrectAnswer(
            firstUser.accessToken,
            questions[2],
          );
          const response = await game.getGameById(
            gameId,
            firstUser.accessToken,
          );
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                    3: AnswerStatus.Correct,
                  },
                  2,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                  },
                  1,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('6 - Second player send correct answer for third questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await gameFactory.sendCorrectAnswer(
            secondUser.accessToken,
            questions[2],
          );
          const response = await game.getMyCurrentGame(firstUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                    3: AnswerStatus.Correct,
                  },
                  2,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Correct,
                  },
                  2,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('7 - First player send correct answer for fourth questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await gameFactory.sendCorrectAnswer(
            firstUser.accessToken,
            questions[3],
          );
          const response = await game.getMyCurrentGame(firstUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                  },
                  3,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Correct,
                  },
                  2,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('8 - Second player send correct answer for fourth questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await gameFactory.sendCorrectAnswer(
            secondUser.accessToken,
            questions[3],
          );
          const response = await game.getMyCurrentGame(firstUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                  },
                  3,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                  },
                  3,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('9 - First player send incorrect th for fifth questions', async () => {
          const { firstUser, secondUser, questions } = expect.getState();

          await game.sendAnswer(faker.random.alpha(5), firstUser.accessToken);
          const response = await game.getMyCurrentGame(secondUser.accessToken);
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                    5: AnswerStatus.Incorrect,
                  },
                  4,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                  },
                  3,
                ),
              },
              GameStatus.Active,
              expectQuestions(questions),
            ),
          );
        });

        it('10 - Second player send incorrect answer for fifth questions', async () => {
          const { firstUser, secondUser, gameId, questions } =
            expect.getState();

          await game.sendAnswer(faker.random.alpha(5), secondUser.accessToken);
          const response = await game.getGameById(
            gameId,
            firstUser.accessToken,
          );
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Correct,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                    5: AnswerStatus.Incorrect,
                  },
                  4,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Correct,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Correct,
                    4: AnswerStatus.Correct,
                    5: AnswerStatus.Incorrect,
                  },
                  3,
                ),
              },
              GameStatus.Finished,
              expectQuestions(questions),
            ),
          );
        });
      },
    );

    describe(
      'The first player went faster, but gave zero correct answers. The second' +
        'player gave one correct answer. Second player wins',
      () => {
        it('Clear data base', async () => {
          await testing.clearDb();
        });

        it('Create data', async () => {
          const [firstUser, secondUser] =
            await usersFactory.createAndLoginUsers(2);
          await questionsFactories.createQuestions(
            preparedGameData.length,
            preparedGameData,
          );
          await game.joinGame(firstUser.accessToken);
          const createdGame = await game.joinGame(secondUser.accessToken);
          await gameFactory.sendManyAnswer(
            firstUser.accessToken,
            createdGame.body.questions,
            {
              1: AnswerStatus.Incorrect,
              2: AnswerStatus.Incorrect,
              3: AnswerStatus.Incorrect,
              4: AnswerStatus.Incorrect,
              5: AnswerStatus.Incorrect,
            },
          );

          await gameFactory.sendManyAnswer(
            secondUser.accessToken,
            createdGame.body.questions,
            {
              1: AnswerStatus.Incorrect,
              2: AnswerStatus.Incorrect,
              3: AnswerStatus.Incorrect,
              4: AnswerStatus.Incorrect,
              5: AnswerStatus.Correct,
            },
          );

          expect.setState({
            firstUser,
            secondUser,
            gameId: createdGame.body.id,
            questions: createdGame.body.questions,
          });
        });

        it('Return game by id', async () => {
          const { firstUser, secondUser, gameId, questions } =
            expect.getState();

          const response = await game.getGameById(
            gameId,
            firstUser.accessToken,
          );
          expect(response.body).toStrictEqual(
            expectViewGame(
              {
                first: expectPlayerProgress(
                  firstUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Incorrect,
                    4: AnswerStatus.Incorrect,
                    5: AnswerStatus.Incorrect,
                  },
                  0,
                ),
                second: expectPlayerProgress(
                  secondUser.user,
                  {
                    1: AnswerStatus.Incorrect,
                    2: AnswerStatus.Incorrect,
                    3: AnswerStatus.Incorrect,
                    4: AnswerStatus.Incorrect,
                    5: AnswerStatus.Correct,
                  },
                  1,
                ),
              },
              GameStatus.Finished,
              expectQuestions(questions),
            ),
          );
        });
      },
    );
  });

  describe('Multiple game pair test', () => {
    it('Clear data base', async () => {
      await testing.clearDb();
    });

    it('Create two pair game and get it', async () => {
      const [firstUser, secondUser, thirdUser, fourthUser] =
        await usersFactory.createAndLoginUsers(4);
        await questionsFactories.createQuestions(
        preparedGameData.length,
        preparedGameData,
      );

      await game.joinGame(firstUser.accessToken);
      const firstGame = await game.joinGame(secondUser.accessToken);

      await game.joinGame(thirdUser.accessToken);
      const secondGame = await game.joinGame(fourthUser.accessToken);
      const getFirstGame = await game.getMyCurrentGame(secondUser.accessToken);
      expect(getFirstGame.status).toBe(HttpStatus.OK);
      expect(getFirstGame.body).toStrictEqual(firstGame.body);

      const getSecondGame = await game.getMyCurrentGame(fourthUser.accessToken);
      expect(getSecondGame.status).toBe(HttpStatus.OK);
      expect(getSecondGame.body).toStrictEqual(secondGame.body);

      expect.setState({
          firstUser,
          firstGame,
          secondUser,
          questions: firstGame.body.questions
      })
    });

    it('Send answer for fist game', async () => {
        const {firstUser, secondUser, firstGame, questions} = expect.getState()

        await gameFactory.sendManyAnswer(firstUser.accessToken, questions, {
            1: AnswerStatus.Correct,
            2: AnswerStatus.Correct,
        })

        await gameFactory.sendCorrectAnswer(secondUser.accessToken, questions[0])

        await gameFactory.sendManyAnswer(firstUser.accessToken, questions, {
            3: AnswerStatus.Correct,
            4: AnswerStatus.Incorrect,
            5: AnswerStatus.Correct
        })

        await gameFactory.sendManyAnswer(secondUser.accessToken, questions, {
            2: AnswerStatus.Correct,
            3: AnswerStatus.Correct,
            4: AnswerStatus.Incorrect,
            5: AnswerStatus.Correct
        })

        const result = await game.getGameById(firstGame.body.id, firstUser.accessToken)
        expect(result.status).toBe(HttpStatus.OK)
        expect(result.body).toStrictEqual(
            expectViewGame(
                {
                    first: expectPlayerProgress(
                        firstUser.user,
                        {
                            1: AnswerStatus.Correct,
                            2: AnswerStatus.Correct,
                            3: AnswerStatus.Correct,
                            4: AnswerStatus.Incorrect,
                            5: AnswerStatus.Correct,
                        },
                        5,
                    ),
                    second: expectPlayerProgress(
                        secondUser.user,
                        {
                            1: AnswerStatus.Correct,
                            2: AnswerStatus.Correct,
                            3: AnswerStatus.Correct,
                            4: AnswerStatus.Incorrect,
                            5: AnswerStatus.Correct,
                        },
                        4,
                    ),
                },
                GameStatus.Finished,
                expectQuestions(questions),
            ),
        );
    })

    it('Create third game by secondUser, connect to the game by firstUser', async () => {
        const {firstUser, secondUser} = expect.getState()

        const createdGame = await gameFactory.createGame(secondUser, firstUser)
        expect(createdGame.status).toBe(HttpStatus.OK)

        const getCreatedGame = await game.getMyCurrentGame(secondUser.accessToken)
        expect(getCreatedGame.body).toStrictEqual(
            expectViewGame(
                {
                    first: expectPlayerProgress(secondUser.user),
                    second: expectPlayerProgress(firstUser.user),
                },
                GameStatus.Active,
                createdGame.body.questions
            ),
        );

        await gameFactory.sendCorrectAnswer(secondUser.accessToken, createdGame.body.questions[0])

        await gameFactory.sendManyAnswer(firstUser.accessToken, createdGame.body.questions, {
            1: AnswerStatus.Incorrect,
            2: AnswerStatus.Correct
        })

        const firstPlayerGetGame = await game.getGameById(createdGame.body.id, secondUser.accessToken)
        expect(firstPlayerGetGame.status).toBe(HttpStatus.OK)

        const secondPlayerGetGame = await game.getGameById(createdGame.body.id, firstUser.accessToken)
        expect(secondPlayerGetGame.status).toBe(HttpStatus.OK)

        expect(firstPlayerGetGame.body).toStrictEqual(secondPlayerGetGame.body)
        expect(firstPlayerGetGame.body).toStrictEqual(
            expectViewGame(
                {
                    first: expectPlayerProgress(
                        secondUser.user,
                        {
                            1: AnswerStatus.Correct,
                        },
                        1,
                    ),
                    second: expectPlayerProgress(
                        firstUser.user,
                        {
                            1: AnswerStatus.Incorrect,
                            2: AnswerStatus.Correct,
                        },
                        1,
                    ),
                },
                GameStatus.Active,
                createdGame.body.questions
            ),
        );
    })
  });
});
