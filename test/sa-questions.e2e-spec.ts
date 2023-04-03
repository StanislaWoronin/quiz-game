import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/config/create-app';
import { QuestionsFactory } from './helpers/factories/questions-factory';
import { Testing } from './helpers/request/testing';
import { Questions } from './helpers/request/questions';
import { preparedSuperUser } from './helpers/prepeared-data/prepared-super-user';
import { expectCreatedQuestion } from './helpers/expect-data/expect-questions';
import { randomUUID } from 'crypto';
import { SortByUserField } from '../src/modules/sa/users/api/dto/query/users-sort-field';
import { SortDirection } from '../src/common/pagination/query-parameters/sort-direction';
import { preparedQuestions } from './helpers/prepeared-data/prepared-questions';
import { getErrorMessage } from './helpers/routing/errors-messages';
import { getErrorsMessage } from './helpers/expect-data/expect-errors-messages';
import { PublishedStatus } from '../src/modules/sa/questions/api/dto/query/published-status';

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(5 * second);

  let app: INestApplication;
  let server;
  let questionsFactories: QuestionsFactory;
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
    questionsFactories = new QuestionsFactory(questions);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST -> "sa/quiz/question"', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('User without permissions try to create a question', async () => {
      const request = await questions.createQuestion(
        preparedSuperUser.notValid,
        preparedQuestions.valid,
      );
      expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Try create question with incorrect input data', async () => {
      const errorsMessages = getErrorsMessage(['body']);

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
      const response = await questions.createQuestion(
        preparedSuperUser.valid,
        preparedQuestions.valid,
      );
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(expectCreatedQuestion());
    });
  });

  describe('PUT -> "sa/quiz/questions/:id/publish"', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const [question] = await questionsFactories.createQuestions(1);

      const questionWithoutAnswers = await questions.createQuestion(
        preparedSuperUser.valid,
        preparedQuestions.withoutAnswers,
      );
      expect(questionWithoutAnswers.status).toBe(HttpStatus.CREATED);

      expect.setState({
        question: question,
        questionId: question.id,
        questionWithoutAnswersId: questionWithoutAnswers.body.id,
      });
    });

    it('Shouldn`t update status if id from uri param not found', async () => {
      const randomId = randomUUID();

      const response = await questions.updateQuestionStatus(
        preparedSuperUser.valid,
        randomId,
        preparedQuestions.publishStatus.true,
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('User without permissions try update "published" status', async () => {
      const { questionId } = expect.getState();

      const response = await questions.updateQuestionStatus(
        preparedSuperUser.notValid,
        questionId,
        preparedQuestions.publishStatus.true,
      );
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it(
      'Shouldn`t update "published" status if specified question' +
        'doesn`t have correct answers',
      async () => {
        const { questionWithoutAnswersId } = expect.getState();

        const response = await questions.updateQuestionStatus(
          preparedSuperUser.valid,
          questionWithoutAnswersId,
          preparedQuestions.publishStatus.true,
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      },
    );

    it('Should update "published" status. Set status "true"', async () => {
      const { questionId } = expect.getState();

      const response = await questions.updateQuestionStatus(
        preparedSuperUser.valid,
        questionId,
        preparedQuestions.publishStatus.true,
      );
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const question = await questions.getQuestions(
        preparedSuperUser.valid,
        {},
      );
      expect(question.status).toBe(HttpStatus.OK);
      expect(question.body.items[1].published).toBe(true);
      expect(question.body.items[1].updatedAt).not.toBeNull();
    });

    it('Should update "published" status. Set status "false"', async () => {
      const { questionId } = expect.getState();

      const response = await questions.updateQuestionStatus(
        preparedSuperUser.valid,
        questionId,
        preparedQuestions.publishStatus.false,
      );
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const question = await questions.getQuestions(
        preparedSuperUser.valid,
        {},
      );
      expect(question.body.items[1].published).toBe(false);
      expect(question.body.items[1].updatedAt).not.toBeNull();
    });
  });

  describe('PUT -> "sa/quiz/questions/:id"', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const [question] = await questionsFactories.createQuestions(1);

      expect.setState({
        question,
        questionId: question.id,
      });
    });

    it('Try update not exist question', async () => {
      const randomId = randomUUID();

      const response = await questions.updateQuestion(
        preparedSuperUser.valid,
        randomId,
        preparedQuestions.update,
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('User without permissions try update question', async () => {
      const { questionId } = expect.getState();

      const response = await questions.updateQuestion(
        preparedSuperUser.notValid,
        questionId,
        preparedQuestions.update,
      );
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Shouldn`t update question if the inputModel has incorrect values', async () => {
      const { questionId } = expect.getState();
      const incorrectBody = getErrorMessage(['body']);

      const requestWithLongInputData = await questions.updateQuestion(
        preparedSuperUser.valid,
        questionId,
        preparedQuestions.notValid.long,
      );
      expect(requestWithLongInputData.status).toBe(HttpStatus.BAD_REQUEST);
      expect(requestWithLongInputData.body).toStrictEqual({
        errorsMessages: incorrectBody,
      });

      const requestWithShortInputData = await questions.updateQuestion(
        preparedSuperUser.valid,
        questionId,
        preparedQuestions.notValid.short,
      );
      expect(requestWithShortInputData.status).toBe(HttpStatus.BAD_REQUEST);
      expect(requestWithShortInputData.body).toStrictEqual({
        errorsMessages: incorrectBody,
      });
    });

    it('Should update question', async () => {
      const { questionId } = expect.getState();

      const response = await questions.updateQuestion(
        preparedSuperUser.valid,
        questionId,
        preparedQuestions.update,
      );
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const question = await questions.getQuestions(
        preparedSuperUser.valid,
        {},
      );
      expect(question.body.items[0].body).toStrictEqual(
        preparedQuestions.update.body,
      );
      expect(question.body.items[0].correctAnswers).toStrictEqual(
        preparedQuestions.update.correctAnswers,
      );
      expect(question.body.items[0].updatedAt).not.toBeNull();
    });

    it(
      'Shouldn`t update question if property "correctAnswers" are not passed but' +
        'property "published" is true`',
      async () => {
        const { questionId } = expect.getState();

        const updateStatus = await questions.updateQuestionStatus(
          preparedSuperUser.valid,
          questionId,
          preparedQuestions.publishStatus.true,
        );
        expect(updateStatus.status).toBe(HttpStatus.NO_CONTENT);

        const requestForPublishedQuestion = await questions.updateQuestion(
          preparedSuperUser.valid,
          questionId,
          preparedQuestions.updateWithoutAnswers,
        );
        expect(requestForPublishedQuestion.status).toBe(HttpStatus.BAD_REQUEST);
      },
    );
  });

  describe('GET -> "sa/quiz/question"', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const createdQuestions = await questionsFactories.createQuestions(5);
      const publishedQuestions =
        await questionsFactories.createQuestionsAndSetPublishStatus(5);

      expect.setState({
        createdQuestions,
        publishedQuestions,
      });
    });

    it('User without permissions try to get a question', async () => {
      const request = await questions.getQuestions(
        preparedSuperUser.notValid,
        {},
      );
      expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Get all question without query', async () => {
      const request = await questions.getQuestions(preparedSuperUser.valid, {});
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body.items).toHaveLength(10);
    });

    it('?publishedStatus=notPublished&sortBy=body&sortDirection=asc&pageNumber=1&pageSize=3', async () => {
      const { createdQuestions } = expect.getState();

      const request = await questions.getQuestions(preparedSuperUser.valid, {
        publishedStatus: PublishedStatus.NotPublished,
        sortBy: SortByUserField.Body,
        sortDirection: SortDirection.Ascending,
        pageSize: 3,
      });
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body).toStrictEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 3,
        totalCount: 5,
        items: [createdQuestions[0], createdQuestions[1], createdQuestions[2]],
      });
    });

    it('?publishedStatus=published&sortBy=body&sortDirection=desc&pageNumber=2&pageSize=3', async () => {
      const { publishedQuestions } = expect.getState();

      const request = await questions.getQuestions(preparedSuperUser.valid, {
        publishedStatus: PublishedStatus.Published,
        sortBy: SortByUserField.Body,
        sortDirection: SortDirection.Ascending,
        pageNumber: 2,
        pageSize: 3,
      });
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body).toStrictEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 3,
        totalCount: 5,
        items: [publishedQuestions[3], publishedQuestions[4]],
      });
    });

    it('Search vie "bodySearchTerm"', async () => {
      const request = await questions.getQuestions(preparedSuperUser.valid, {
        bodySearchTerm: '1',
      });
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body.items).toHaveLength(2);
      expect(request.body.items[0].body).toMatch(/^1/);
      expect(request.body.items[1].body).toMatch(/^1/);
    });
  });

  describe('DELETE -> "sa/quiz/question/:id', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const [createdQuestions] = await questionsFactories.createQuestions(1);

      expect.setState({
        questionId: createdQuestions.id,
      });
    });

    it('User without permissions try delete question', async () => {
      const { questionId } = expect.getState();

      const status = await questions.deleteQuestion(
        preparedSuperUser.notValid,
        questionId,
      );
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Should delete question', async () => {
      const { questionId } = expect.getState();

      const status = await questions.deleteQuestion(
        preparedSuperUser.valid,
        questionId,
      );
      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('Try delete not exist question', async () => {
      const { questionId } = expect.getState();
      const randomId = randomUUID();

      const status = await questions.deleteQuestion(
        preparedSuperUser.valid,
        randomId,
      );
      expect(status).toBe(HttpStatus.NOT_FOUND);

      const deletedAgain = await questions.deleteQuestion(
        preparedSuperUser.valid,
        questionId,
      );
      expect(deletedAgain).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
