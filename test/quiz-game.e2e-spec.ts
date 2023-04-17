import { HttpStatus, INestApplication } from '@nestjs/common';
import { QuestionsFactory } from './helpers/factories/questions-factory';
import { Questions } from './helpers/request/questions';
import { Testing } from './helpers/request/testing';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/config/create-app';
import { Game } from './helpers/request/game';
import { Users } from './helpers/request/users';
import { UsersFactory } from './helpers/factories/users-factory';
import { Auth } from './helpers/request/auth';
import {
  expectAnswer,
  expectPlayerProgress,
  expectQuestions,
  expectViewGame,
} from './helpers/expect-data/expect-game';
import { GameStatus } from '../src/modules/public/pair-quiz-game/shared/game-status';
import { AnswerStatus } from '../src/modules/public/pair-quiz-game/shared/answer-status';
import { preparedGameData } from './helpers/prepeared-data/prepared-game-data';
import { GameFactory } from './helpers/factories/game-factory';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { expectPagination } from './helpers/expect-data/expect-pagination';
import { SortByGameField } from '../src/modules/public/pair-quiz-game/api/dto/query/games-sort-field';
import { SortDirection } from '../src/common/pagination/query-parameters/sort-direction';
import { TopPlayersSortField } from '../src/modules/public/pair-quiz-game/api/dto/query/top-players-sort-field';
import { sleep } from './helpers/helpers';
import { preparedAnswer } from './helpers/prepeared-data/prepared-answer';

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(100 * second);

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

      it('Game over if the second player hasn`t answered all the questions', async () => {
        const [fistPlayer, secondPlayer] =
          await usersFactory.createAndLoginUsers(2, 3);
        const activeGame = await gameFactory.createGame(
          fistPlayer,
          secondPlayer,
        );
        const questions = activeGame.body.questions;
        await gameFactory.sendCorrectAnswer(
          fistPlayer.accessToken,
          questions[0],
        );

        await gameFactory.sendManyAnswer(fistPlayer.accessToken, questions, {
          2: AnswerStatus.Incorrect,
          3: AnswerStatus.Incorrect,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Correct,
        });
        await gameFactory.sendManyAnswer(secondPlayer.accessToken, questions, {
          1: AnswerStatus.Correct,
          2: AnswerStatus.Correct,
        });

        await sleep(11);

        const secondPlayerTryAnswered = await gameFactory.sendCorrectAnswer(
          secondPlayer.accessToken,
          activeGame.body.questions[1],
        );
        expect(secondPlayerTryAnswered.status).toBe(HttpStatus.FORBIDDEN);

        const finishedGame = await game.getGameById(
          activeGame.body.id,
          fistPlayer.accessToken,
        );
        expect(finishedGame.status).toBe(HttpStatus.OK);
        expect(finishedGame.body.status).toBe(GameStatus.Finished);
        expect(finishedGame.body.secondPlayerProgress);
        expect(finishedGame.body.secondPlayerProgress.score).toBe(2);

        console.log(
          finishedGame.body.secondPlayerProgress.answers.map(
            (v) => v.questionId,
          ),
        );

        expect(finishedGame.body.secondPlayerProgress.answers).toEqual([
          expectAnswer(AnswerStatus.Correct),
          expectAnswer(AnswerStatus.Correct),
          expectAnswer(AnswerStatus.Incorrect, false),
          expectAnswer(AnswerStatus.Incorrect, false),
          expectAnswer(AnswerStatus.Incorrect, false),
        ]);
      });
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
    'GET -> "pair-game-quiz/pair/my-current". ' +
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
                first: expectPlayerProgress(firstUser.user, {
                  1: AnswerStatus.Incorrect,
                  2: AnswerStatus.Incorrect,
                  3: AnswerStatus.Incorrect,
                  4: AnswerStatus.Incorrect,
                  5: AnswerStatus.Incorrect,
                }),
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
        questions: firstGame.body.questions,
      });
    });

    it('Send answer for fist game', async () => {
      const { firstUser, secondUser, firstGame, questions } = expect.getState();

      await gameFactory.sendCorrectAnswer(firstUser.accessToken, questions[0]);
      const answer1 = await game.getMyCurrentGame(firstUser.accessToken);
      expect(answer1.body.questions).toStrictEqual(questions);

      await gameFactory.sendCorrectAnswer(firstUser.accessToken, questions[1]);
      const answer2 = await game.getMyCurrentGame(firstUser.accessToken);
      expect(answer2.body.questions).toStrictEqual(questions);

      await gameFactory.sendCorrectAnswer(secondUser.accessToken, questions[0]);
      const answer3 = await game.getMyCurrentGame(secondUser.accessToken);
      expect(answer3.body.questions).toStrictEqual(questions);

      await gameFactory.sendManyAnswer(firstUser.accessToken, questions, {
        3: AnswerStatus.Incorrect,
        4: AnswerStatus.Incorrect,
        5: AnswerStatus.Incorrect,
      });

      await gameFactory.sendManyAnswer(secondUser.accessToken, questions, {
        2: AnswerStatus.Incorrect,
        3: AnswerStatus.Correct,
        4: AnswerStatus.Incorrect,
        5: AnswerStatus.Correct,
      });

      const result = await game.getGameById(
        firstGame.body.id,
        firstUser.accessToken,
      );
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(
              firstUser.user,
              {
                1: AnswerStatus.Correct,
                2: AnswerStatus.Correct,
                3: AnswerStatus.Incorrect,
                4: AnswerStatus.Incorrect,
                5: AnswerStatus.Incorrect,
              },
              3,
            ),
            second: expectPlayerProgress(
              secondUser.user,
              {
                1: AnswerStatus.Correct,
                2: AnswerStatus.Incorrect,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Incorrect,
                5: AnswerStatus.Correct,
              },
              3,
            ),
          },
          GameStatus.Finished,
          expectQuestions(questions),
        ),
      );
    });

    it('Create third game by secondUser, connect to the game by firstUser', async () => {
      const { firstUser, secondUser } = expect.getState();

      const createdGame = await gameFactory.createGame(secondUser, firstUser);
      expect(createdGame.status).toBe(HttpStatus.OK);

      const getCreatedGame = await game.getMyCurrentGame(
        secondUser.accessToken,
      );
      expect(getCreatedGame.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(secondUser.user),
            second: expectPlayerProgress(firstUser.user),
          },
          GameStatus.Active,
          createdGame.body.questions,
        ),
      );

      await gameFactory.sendCorrectAnswer(
        secondUser.accessToken,
        createdGame.body.questions[0],
      );

      await gameFactory.sendManyAnswer(
        firstUser.accessToken,
        createdGame.body.questions,
        {
          1: AnswerStatus.Incorrect,
          2: AnswerStatus.Correct,
        },
      );

      const firstPlayerGetGame = await game.getGameById(
        createdGame.body.id,
        secondUser.accessToken,
      );
      expect(firstPlayerGetGame.status).toBe(HttpStatus.OK);

      const secondPlayerGetGame = await game.getGameById(
        createdGame.body.id,
        firstUser.accessToken,
      );
      expect(secondPlayerGetGame.status).toBe(HttpStatus.OK);

      expect(firstPlayerGetGame.body).toStrictEqual(secondPlayerGetGame.body);
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
          createdGame.body.questions,
        ),
      );

      await gameFactory.sendManyAnswer(
        secondUser.accessToken,
        createdGame.body.questions,
        {
          2: AnswerStatus.Incorrect,
          3: AnswerStatus.Correct,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Correct,
        },
      );

      await gameFactory.sendManyAnswer(
        firstUser.accessToken,
        createdGame.body.questions,
        {
          3: AnswerStatus.Correct,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Correct,
        },
      );

      const response = await game.getGameById(
        createdGame.body.id,
        secondUser.accessToken,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(
              secondUser.user,
              {
                1: AnswerStatus.Correct,
                2: AnswerStatus.Incorrect,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Correct,
              },
              5,
            ),
            second: expectPlayerProgress(
              firstUser.user,
              {
                1: AnswerStatus.Incorrect,
                2: AnswerStatus.Correct,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Correct,
              },
              4,
            ),
          },
          GameStatus.Finished,
          createdGame.body.questions,
        ),
      );
    });

    it('Create fourth game by secondUser, connect to the game by firstUser', async () => {
      const { firstUser, secondUser } = expect.getState();

      const createdGame = await gameFactory.createGame(secondUser, firstUser);
      expect(createdGame.status).toBe(HttpStatus.OK);

      await gameFactory.sendManyAnswer(
        secondUser.accessToken,
        createdGame.body.questions,
        {
          1: AnswerStatus.Incorrect,
          2: AnswerStatus.Incorrect,
          3: AnswerStatus.Correct,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Incorrect,
        },
      );

      await gameFactory.sendManyAnswer(
        firstUser.accessToken,
        createdGame.body.questions,
        {
          1: AnswerStatus.Correct,
          2: AnswerStatus.Incorrect,
          3: AnswerStatus.Correct,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Correct,
        },
      );

      const response = await game.getGameById(
        createdGame.body.id,
        firstUser.accessToken,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(
              secondUser.user,
              {
                1: AnswerStatus.Incorrect,
                2: AnswerStatus.Incorrect,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Incorrect,
              },
              3,
            ),
            second: expectPlayerProgress(
              firstUser.user,
              {
                1: AnswerStatus.Correct,
                2: AnswerStatus.Incorrect,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Correct,
              },
              4,
            ),
          },
          GameStatus.Finished,
          createdGame.body.questions,
        ),
      );
    });

    it('Create fifth game by secondUser, connect to the game by firstUser', async () => {
      const { firstUser, secondUser } = expect.getState();

      const createdGame = await gameFactory.createGame(secondUser, firstUser);
      expect(createdGame.status).toBe(HttpStatus.OK);

      await gameFactory.sendManyAnswer(
        secondUser.accessToken,
        createdGame.body.questions,
        {
          1: AnswerStatus.Correct,
          2: AnswerStatus.Correct,
          3: AnswerStatus.Correct,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Correct,
        },
      );

      await gameFactory.sendManyAnswer(
        firstUser.accessToken,
        createdGame.body.questions,
        {
          1: AnswerStatus.Correct,
          2: AnswerStatus.Correct,
          3: AnswerStatus.Correct,
          4: AnswerStatus.Correct,
          5: AnswerStatus.Correct,
        },
      );

      const response = await game.getGameById(
        createdGame.body.id,
        firstUser.accessToken,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expectViewGame(
          {
            first: expectPlayerProgress(
              secondUser.user,
              {
                1: AnswerStatus.Correct,
                2: AnswerStatus.Correct,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Correct,
              },
              6,
            ),
            second: expectPlayerProgress(
              firstUser.user,
              {
                1: AnswerStatus.Correct,
                2: AnswerStatus.Correct,
                3: AnswerStatus.Correct,
                4: AnswerStatus.Correct,
                5: AnswerStatus.Correct,
              },
              5,
            ),
          },
          GameStatus.Finished,
          createdGame.body.questions,
        ),
      );
    });
  });

  describe('Test questions order', () => {
    it('Clear data base', async () => {
      await testing.clearDb();
    });

    it('Start', async () => {
      const count = 5;
      const players = await usersFactory.createAndLoginUsers(count * 2);
      await questionsFactories.createQuestions(
        preparedGameData.length,
        preparedGameData,
      );

      for (let i = 0; i < count; i++) {
        const firstPlayer = players[i * 2];
        const secondPlayer = players[i * 2 + 1];
        await game.joinGame(firstPlayer.accessToken);
        const joinIntoGame = await game.joinGame(secondPlayer.accessToken);

        const getGameById = await game.getGameById(
          joinIntoGame.body.id,
          firstPlayer.accessToken,
        );
        const getMyGame = await game.getMyCurrentGame(firstPlayer.accessToken);

        expect(joinIntoGame.body.questions).toStrictEqual(
          getMyGame.body.questions,
        );
        expect(joinIntoGame.body.questions).toStrictEqual(
          getGameById.body.questions,
        );
      }
    });
  });

  describe(
    'GET -> "pair-game-quiz/pair/my". ' +
      'Return all games current user in status "Current" and "Finished"',
    () => {
      it('Clear data base', async () => {
        await testing.clearDb();
      });

      it('Shouldn`t return game if user unauthorized', async () => {
        const response = await game.getMyGames({});
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('Create "Pending" game, and get all my games, should return empty array', async () => {
        const [firstPlayer] = await usersFactory.createAndLoginUsers(1);
        await questionsFactories.createQuestions(
          preparedGameData.length,
          preparedGameData,
        );
        const pendingGame = await game.joinGame(firstPlayer.accessToken);

        const response = await game.getMyGames({}, firstPlayer.accessToken);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectPagination([], { totalCount: 0 }),
        );

        expect.setState({
          firstPlayer,
          game: pendingGame,
        });
      });

      it('Second player join into the game', async () => {
        const { firstPlayer } = expect.getState();

        const [secondPlayer] = await usersFactory.createAndLoginUsers(1, 1);
        const activeGame = await game.joinGame(secondPlayer.accessToken);

        const response = await game.getMyGames({}, firstPlayer.accessToken);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectPagination([activeGame.body], { totalCount: 1 }),
        );

        expect.setState({
          secondPlayer,
          firstGame: activeGame,
          firstGameQuestions: activeGame.body.questions,
        });
      });

      it('Send answer, and return my games', async () => {
        const { firstPlayer, secondPlayer, firstGame, firstGameQuestions } =
          expect.getState();

        await gameFactory.sendCorrectAnswer(
          firstPlayer.accessToken,
          firstGameQuestions[0],
        );

        const gameUntilFirstAnswer = await game.getMyGames(
          {},
          firstPlayer.accessToken,
        );
        expect(gameUntilFirstAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilFirstAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    firstPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                    },
                    1,
                  ),
                  second: expectPlayerProgress(secondPlayer.user, {}),
                },
                GameStatus.Active,
                firstGame.body.questions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendManyAnswer(
          secondPlayer.accessToken,
          firstGameQuestions,
          {
            1: AnswerStatus.Incorrect,
            2: AnswerStatus.Correct,
          },
        );

        const gameUntilSecondAnswer = await game.getMyGames(
          {},
          firstPlayer.accessToken,
        );
        expect(gameUntilSecondAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilSecondAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    firstPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                    },
                    1,
                  ),
                  second: expectPlayerProgress(
                    secondPlayer.user,
                    {
                      1: AnswerStatus.Incorrect,
                      2: AnswerStatus.Correct,
                    },
                    1,
                  ),
                },
                GameStatus.Active,
                firstGame.body.questions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendManyAnswer(
          firstPlayer.accessToken,
          firstGameQuestions,
          {
            2: AnswerStatus.Correct,
            3: AnswerStatus.Incorrect,
          },
        );

        const gameUntilThirdAnswer = await game.getMyGames(
          {},
          secondPlayer.accessToken,
        );
        expect(gameUntilThirdAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilThirdAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    firstPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                    },
                    2,
                  ),
                  second: expectPlayerProgress(
                    secondPlayer.user,
                    {
                      1: AnswerStatus.Incorrect,
                      2: AnswerStatus.Correct,
                    },
                    1,
                  ),
                },
                GameStatus.Active,
                firstGame.body.questions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendManyAnswer(
          secondPlayer.accessToken,
          firstGameQuestions,
          {
            3: AnswerStatus.Incorrect,
            4: AnswerStatus.Correct,
          },
        );

        const gameUntilFourthAnswer = await game.getMyGames(
          {},
          secondPlayer.accessToken,
        );
        expect(gameUntilFourthAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilFourthAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    firstPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                    },
                    2,
                  ),
                  second: expectPlayerProgress(
                    secondPlayer.user,
                    {
                      1: AnswerStatus.Incorrect,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                    },
                    2,
                  ),
                },
                GameStatus.Active,
                firstGame.body.questions,
              ),
            ],
            { totalCount: 1 },
          ),
        );
      });

      it('Create new game by third user and fourth user', async () => {
        const [thirdUser, fourthUser] = await usersFactory.createAndLoginUsers(
          2,
          2,
        );
        const secondGame = await gameFactory.createGame(fourthUser, thirdUser);

        const response = await game.getMyGames({}, thirdUser.accessToken);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectPagination([secondGame.body], { totalCount: 1 }),
        );

        expect.setState({
          thirdPlayer: thirdUser,
          fourthPlayer: fourthUser,
          secondGameQuestions: secondGame.body.questions,
        });
      });

      it('Send answer for second game, and return all user games', async () => {
        const { thirdPlayer, fourthPlayer, secondGameQuestions } =
          expect.getState();

        await gameFactory.sendManyAnswer(
          thirdPlayer.accessToken,
          secondGameQuestions,
          {
            1: AnswerStatus.Correct,
            2: AnswerStatus.Correct,
            3: AnswerStatus.Incorrect,
          },
        );

        const gameUntilSecondAnswer = await game.getMyGames(
          {},
          fourthPlayer.accessToken,
        );
        expect(gameUntilSecondAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilSecondAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(fourthPlayer.user, {}),
                  second: expectPlayerProgress(
                    thirdPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                    },
                    2,
                  ),
                },
                GameStatus.Active,
                secondGameQuestions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendManyAnswer(
          fourthPlayer.accessToken,
          secondGameQuestions,
          {
            1: AnswerStatus.Correct,
            2: AnswerStatus.Incorrect,
          },
        );

        const gameUntilThirdAnswer = await game.getMyGames(
          {},
          fourthPlayer.accessToken,
        );
        expect(gameUntilThirdAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilThirdAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    fourthPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Incorrect,
                    },
                    1,
                  ),
                  second: expectPlayerProgress(
                    thirdPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                    },
                    2,
                  ),
                },
                GameStatus.Active,
                secondGameQuestions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendManyAnswer(
          thirdPlayer.accessToken,
          secondGameQuestions,
          {
            4: AnswerStatus.Correct,
            5: AnswerStatus.Incorrect,
          },
        );

        const gameUntilFourthAnswer = await game.getMyGames(
          {},
          thirdPlayer.accessToken,
        );
        expect(gameUntilFourthAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilFourthAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    fourthPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Incorrect,
                    },
                    1,
                  ),
                  second: expectPlayerProgress(
                    thirdPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                      5: AnswerStatus.Incorrect,
                    },
                    3,
                  ),
                },
                GameStatus.Active,
                secondGameQuestions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendManyAnswer(
          fourthPlayer.accessToken,
          secondGameQuestions,
          {
            3: AnswerStatus.Incorrect,
            4: AnswerStatus.Incorrect,
            5: AnswerStatus.Correct,
          },
        );

        const gameUntilFifthAnswer = await game.getMyGames(
          {},
          thirdPlayer.accessToken,
        );
        expect(gameUntilFifthAnswer.status).toBe(HttpStatus.OK);
        expect(gameUntilFifthAnswer.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    fourthPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Incorrect,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Incorrect,
                      5: AnswerStatus.Correct,
                    },
                    2,
                  ),
                  second: expectPlayerProgress(
                    thirdPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                      5: AnswerStatus.Incorrect,
                    },
                    4,
                  ),
                },
                GameStatus.Finished,
                secondGameQuestions,
              ),
            ],
            { totalCount: 1 },
          ),
        );
      });

      it('End fist game', async () => {
        const { firstPlayer, secondPlayer, firstGameQuestions } =
          expect.getState();

        await gameFactory.sendManyAnswer(
          firstPlayer.accessToken,
          firstGameQuestions,
          {
            4: AnswerStatus.Correct,
            5: AnswerStatus.Correct,
          },
        );

        const fistPlayerEndGame = await game.getMyGames(
          {},
          secondPlayer.accessToken,
        );
        expect(fistPlayerEndGame.status).toBe(HttpStatus.OK);
        expect(fistPlayerEndGame.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    firstPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                      5: AnswerStatus.Correct,
                    },
                    4,
                  ),
                  second: expectPlayerProgress(
                    secondPlayer.user,
                    {
                      1: AnswerStatus.Incorrect,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                    },
                    2,
                  ),
                },
                GameStatus.Active,
                firstGameQuestions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        await gameFactory.sendCorrectAnswer(
          secondPlayer.accessToken,
          firstGameQuestions[4],
        );

        const secondPlayerEndGame = await game.getMyGames(
          {},
          secondPlayer.accessToken,
        );
        expect(secondPlayerEndGame.status).toBe(HttpStatus.OK);
        expect(secondPlayerEndGame.body).toStrictEqual(
          expectPagination(
            [
              expectViewGame(
                {
                  first: expectPlayerProgress(
                    firstPlayer.user,
                    {
                      1: AnswerStatus.Correct,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                      5: AnswerStatus.Correct,
                    },
                    5,
                  ),
                  second: expectPlayerProgress(
                    secondPlayer.user,
                    {
                      1: AnswerStatus.Incorrect,
                      2: AnswerStatus.Correct,
                      3: AnswerStatus.Incorrect,
                      4: AnswerStatus.Correct,
                      5: AnswerStatus.Correct,
                    },
                    3,
                  ),
                },
                GameStatus.Finished,
                firstGameQuestions,
              ),
            ],
            { totalCount: 1 },
          ),
        );

        expect.setState({
          endedFistGame: secondPlayerEndGame.body.items[0],
        });
      });

      it(
        'Testing pagination. Create some game by fist user, and return' +
          'all game without pagination',
        async () => {
          const { firstPlayer, endedFistGame } = expect.getState();
          const finishedGames = await gameFactory.createFinishedGames(12, {
            first: firstPlayer,
            startFrom: 4,
          });

          const expectGames = finishedGames.expectGames.reverse();

          const result = await game.getMyGames({}, firstPlayer.accessToken);
          expect(result.body).toStrictEqual(
            expectPagination([...expectGames, endedFistGame], {
              totalCount: 13,
            }),
          );

          expect.setState({
            accessToken: firstPlayer.accessToken,
            expectGames: [...finishedGames.expectGames, endedFistGame],
            totalCount: 13,
          });
        },
      );

      it('Start new game by fist player and return games with pagination', async () => {
        const {
          firstPlayer,
          thirdPlayer,
          accessToken,
          expectGames,
          totalCount,
        } = expect.getState();

        const newGame = await gameFactory.createGame(thirdPlayer, firstPlayer);

        const fistResult = await game.getMyGames(
          {
            sortBy: SortByGameField.Status,
            sortDirection: SortDirection.Ascending,
            pageSize: 5,
          },
          accessToken,
        );
        expect(fistResult.body).toStrictEqual(
          expectPagination(
            [
              newGame.body,
              expectGames[0],
              expectGames[1],
              expectGames[2],
              expectGames[3],
            ],
            { pageSize: 5, totalCount: totalCount + 1 },
          ),
        );

        const secondResult = await game.getMyGames(
          {
            sortBy: SortByGameField.Status,
            sortDirection: SortDirection.Descending,
            pageSize: 3,
            pageNumber: 3,
          },
          accessToken,
        );

        expect(secondResult.body).toStrictEqual(
          expectPagination([expectGames[6], expectGames[7], expectGames[8]], {
            pageSize: 3,
            page: 3,
            totalCount: totalCount + 1,
          }),
        );
      });
    },
  );

  describe(
    'GET -> "pair-game-quiz/users/my-statistic"' +
      'Return current user statistic.',
    () => {
      it('Clear data base', async () => {
        await testing.clearDb();
      });

      // it('Shouldn`t return statistic if user unauthorized', async () => {
      //     const response = await game.getStatistic()
      //     expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      // })

      it('Create and return statistic', async () => {
        await questionsFactories.createQuestions(
          preparedGameData.length,
          preparedGameData,
        );

        const expectStats = await gameFactory.createFinishedGames(11, {});

        const response = await game.getStatistic(expectStats.accessToken);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(expectStats.playerStats);
      });
    },
  );

  describe('GET -> Top players', () => {
    it('Clear data base', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      await questionsFactories.createQuestions(
        preparedGameData.length,
        preparedGameData,
      );

      const gamesStat = await gameFactory.createPlayersTop(5, 5);
      expect.setState({ gamesStat });
    });

    it('Return statistic without pagination', async () => {
      const { gamesStat } = expect.getState();

      const expectStats = gameFactory.sortStats(gamesStat, [
        TopPlayersSortField.AvgScoresDESC,
        TopPlayersSortField.SumScoreDESC,
      ]);

      const response = await game.getTopPlayers({});
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expectPagination(expectStats, { totalCount: 5 }),
      );
    });

    it('Return statistic with pagination', async () => {
      const { gamesStat } = expect.getState();

      const expectStats = gameFactory.sortStats(gamesStat, [
        TopPlayersSortField.LossesCountASC,
        TopPlayersSortField.GamesCountDESC,
      ]);

      const response = await game.getTopPlayers({
        sort: [
          TopPlayersSortField.LossesCountASC,
          TopPlayersSortField.GamesCountDESC,
        ],
        pageNumber: 2,
        pageSize: 3,
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expectPagination([expectStats[3], expectStats[4]], {
          page: 2,
          pageSize: 3,
          totalCount: 5,
        }),
      );
    });

    it('Return statistic with one sort parametr', async () => {
      const { gamesStat } = expect.getState();

      const expectStats = gameFactory.sortStats(gamesStat, [
        TopPlayersSortField.AvgScoresDESC,
      ]);

      const response = await game.getTopPlayers({
        sort: [TopPlayersSortField.AvgScoresDESC],
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expectPagination(expectStats, { totalCount: 5 }),
      );
    });

    it('Return statistic with pagination', async () => {
      const { gamesStat } = expect.getState();

      const expectStats = gameFactory.sortStats(gamesStat, [
        TopPlayersSortField.LossesCountASC,
        TopPlayersSortField.GamesCountDESC,
      ]);

      const response = await game.getTopPlayers({
        sort: [
          TopPlayersSortField.LossesCountASC,
          TopPlayersSortField.GamesCountDESC,
        ],
        pageNumber: 2,
        pageSize: 3,
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expectPagination([expectStats[3], expectStats[4]], {
          page: 2,
          pageSize: 3,
          totalCount: 5,
        }),
      );
    });

    it('Test validation query parametrs', async () => {
      const response = await game.getTopPlayers({
        sort: ['avgScoresAsc', 'gamesCountAsc'],
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
