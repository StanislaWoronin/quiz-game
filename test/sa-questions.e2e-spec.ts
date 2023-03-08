import {Test, TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {AppModule} from './../src/app.module';
import {createApp} from '../src/helpers/create-app';
import {QuestionsFactories} from './helpers/questions-factories';
import {Testing} from './helpers/request/testing';
import {Questions} from './helpers/request/questions';
import {preparedSuperUser} from './helpers/prepeared-data/prepared-super-user';
import {preparedQuestions} from './helpers/prepeared-data/prepared-questions';
import {
  expectCreatedQuestion,
  expectResponseForGetAllQuestions,
} from './helpers/expect-data/expect-questions';
import {CreatedQuestions} from "../src/modules/questions/api/view/created-questions";
import {preparedQuery} from "./helpers/prepeared-data/prepared-query";
import {randomUUID} from "crypto";
import {getErrorMessage} from "./helpers/routing/errors-messages";
import {SortByField} from "../src/shared/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../src/shared/pagination/query-parameters/sort-direction";

describe('/sa/quiz/questions (e2e)', () => {
  const second = 1000;
  jest.setTimeout(5 * second);

  let app: INestApplication;
  let server;
  let questionsFactories: QuestionsFactories;
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
    questionsFactories = new QuestionsFactories(questions);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Test request', () => {
    describe('POST -> "sa/quiz/question"', () => {
      // it('Clear all data', async () => {
      //   await testing.clearDb();
      // });

      it('User without permissions try to create a question', async () => {
        const request = await questions.createQuestion(
          preparedSuperUser.notValid,
          preparedQuestions.valid,
        );
        expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('Try create question with incorrect input data', async () => {
        const errorsMessages = questionsFactories.getErrorsMessage(['body']);

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
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(
          expectCreatedQuestion,
        );
      });
    });

    describe('PUT -> "sa/quiz/questions/:id/publish"', () => {
      // it('Clear all data', async () => {
      //   await testing.clearDb();
      // });

      it('Create data', async () => {
        const question = await questions.createQuestion(
            preparedSuperUser.valid,
            preparedQuestions.valid,
        );
        expect(question.status).toBe(HttpStatus.OK);

        const questionWithoutAnswers = await questions.createQuestion(
            preparedSuperUser.valid,
            preparedQuestions.withoutAnswers,
        )
        expect(questionWithoutAnswers.status).toBe(HttpStatus.OK);

        expect.setState({
          question: question.body,
          questionId: question.body.id,
          questionWithoutAnswersId: questionWithoutAnswers.body.id,
        })
      })

      it('User without permissions try update "published" status', async () => {
        const { questionId } = expect.getState()

        const response = await questions
            .updateQuestionStatus(preparedSuperUser.notValid, questionId, preparedQuestions.publishStatus.true)
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      })

      it('Shouldn`t update "published" status if the inputModel has incorrect' +
          'values or specified question doesn`t have correct answers', async () => {

        const { questionWithoutAnswersId } = expect.getState()

        const response = await questions
            .updateQuestionStatus(preparedSuperUser.valid, questionWithoutAnswersId, preparedQuestions.publishStatus.true)
        expect(response.status).toBe(HttpStatus.BAD_REQUEST)
      })

      it('Should update "published" status. Set status "true"', async () => {
        const { questionId } = expect.getState()

        const response = await questions
            .updateQuestionStatus(preparedSuperUser.valid, questionId, preparedQuestions.publishStatus.true)
        expect(response.status).toBe(HttpStatus.NO_CONTENT)
      })

      it('Should update "published" status. Set status "false"', async () => {
        const { questionId } = expect.getState()

        const response = await questions
            .updateQuestionStatus(preparedSuperUser.valid, questionId, preparedQuestions.publishStatus.false)
        expect(response.status).toBe(HttpStatus.NO_CONTENT)
      })
    })

    describe('PUT -> "sa/quiz/questions/:id"', () => {
      // it('Clear all data', async () => {
      //   await testing.clearDb();
      // });

      it('Create data', async () => {
        const response = await questions.createQuestion(
            preparedSuperUser.valid,
            preparedQuestions.valid,
        );
        expect(response.status).toBe(HttpStatus.OK);

        expect.setState({
          question: response.body,
          questionId: response.body.id
        })
      })

      // it('Try update not exist question', async () => {
      //   const randomId = randomUUID()
      //
      //   const response = await questions.updateQuestion(preparedSuperUser.valid, randomId, preparedQuestions.update)
      //   expect(response.status).toBe(HttpStatus.NOT_FOUND)
      // })
      //
      // it('User without permissions try update question', async () => {
      //   const {questionId} = expect.getState()
      //
      //   const response = await questions
      //       .updateQuestion(preparedSuperUser.notValid, questionId, preparedQuestions.update)
      //   expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      // })
      //
      // it('Shouldn update question if the inputModel has incorrect values or' +
      //     'property "correctAnswers" are not passed but property "published" is true`',
      //     async () => {
      //
      //   const {questionId} = expect.getState()
      //   const incorrectBody = getErrorMessage(['body'])
      //   const incorrectAnswers = getErrorMessage(['body'])
      //
      //   const requestWithLongInputData = await questions
      //       .updateQuestion(preparedSuperUser.valid, questionId, preparedQuestions.notValid.long)
      //   expect(requestWithLongInputData.status).toBe(HttpStatus.BAD_REQUEST)
      //   expect(requestWithLongInputData.body).toStrictEqual({errorsMessages: incorrectBody})
      //
      //   const requestWithShortInputData = await questions
      //       .updateQuestion(preparedSuperUser.valid, questionId, preparedQuestions.notValid.short)
      //   expect(requestWithLongInputData.status).toBe(HttpStatus.BAD_REQUEST)
      //   expect(requestWithLongInputData.body).toStrictEqual({errorsMessages: incorrectBody})
      //
      //   const updateStatus = await questions
      //       .updateQuestionStatus(preparedSuperUser.valid, questionId, preparedQuestions.publishStatus.true)
      //   expect(updateStatus.status).toBe(HttpStatus.NO_CONTENT)
      //
      //   const requestForPublishedQuestion = await questions
      //       .updateQuestion(preparedSuperUser.valid, questionId, preparedQuestions.updateWithoutAnswers)
      //   expect(requestForPublishedQuestion.status).toBe(HttpStatus.BAD_REQUEST)
      //   expect(requestWithLongInputData.body).toStrictEqual({errorsMessages: incorrectAnswers})
      // })

      it('Should update question', async () => {
        const {questionId} = expect.getState()

        const response = await questions
            .updateQuestion(preparedSuperUser.valid, questionId, preparedQuestions.update)
        expect(response.status).toBe(HttpStatus.NO_CONTENT)
      })
    })

    describe('GET -> "sa/quiz/question"', () => {
      // it('Clear all data', async () => {
      //   await testing.clearDb();
      // });

      it('Create data', async () => {
        const createdQuestions = await questionsFactories.createQuestions(5)
        const publishedQuestionsId = await questionsFactories.createQuestionsAndSetPublishStatus(5)

        expect.setState({
          createdQuestions,
          publishedQuestionsId
        })
      })

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
        expect(request.body.items).toHaveLength(10)
      })

      it('?publishedStatus=notPublished&sortBy=id&sortDirection=asc&pageNumber=1&pageSize=3', async () => {
        const {createdQuestions} = expect.getState()
        const expectResponse = expectResponseForGetAllQuestions(
          SortByField.Id,
          SortDirection.Ascending,
          2,
          1,
          3,
          5,
          [...createdQuestions]
        )

        const request = await questions.getAllQuestions(
          preparedSuperUser.valid,
          preparedQuery.published_id_asc_1_3
        );
        expect(request.status).toBe(HttpStatus.OK);
        expect(request.body).toStrictEqual(expectResponse)
      })

      it('?publishedStatus=published&sortBy=body&sortDirection=desc&pageNumber=2&pageSize=3', async () => {
        const {publishedQuestionsId} = expect.getState()

        const expectResponse = expectResponseForGetAllQuestions(
          SortByField.Body,
          SortDirection.Descending,
          2,
          2,
          3,
          5,
          [...publishedQuestionsId]
        )

        const request = await questions.getAllQuestions(
          preparedSuperUser.valid,
          preparedQuery.notPublished_body_desc_2_3
        );
        expect(request.status).toBe(HttpStatus.OK);
        expect(request.body).toStrictEqual(expectResponse)
      })
    });

    // describe('DELETE -> "sa/quiz/question/:id', () => {
    //   // it('Clear all data', async () => {
    //   //   await testing.clearDb();
    //   // });
    //
    //   it('Create data', async () => {
    //     const [createdQuestions] = await questionsFactories.createQuestions(1)
    //
    //     expect. setState({
    //       questionId: createdQuestions.id
    //     })
    //   })
    //
    //   it('User without permissions try delete question', async () => {
    //     const { questionId } = expect.getState()
    //
    //     const status = await questions.deleteQuestion(preparedSuperUser.notValid, questionId)
    //     expect(status).toBe(HttpStatus.UNAUTHORIZED)
    //   })
    //
    //   it('Should delete question', async () => {
    //     const { questionId } = expect.getState()
    //
    //     const status = await questions.deleteQuestion(preparedSuperUser.valid, questionId)
    //     expect(status).toBe(HttpStatus.NO_CONTENT)
    //   })
    //
    //   it('Try delete not exist question', async () => {
    //     const { questionId } = expect.getState()
    //     const randomId = randomUUID()
    //
    //     const status = await questions.deleteQuestion(preparedSuperUser.valid, randomId)
    //     expect(status).toBe(HttpStatus.NOT_FOUND)
    //
    //     const deletedAgain = await questions.deleteQuestion(preparedSuperUser.valid, questionId)
    //     expect(deletedAgain).toBe(HttpStatus.NOT_FOUND)
    //   })
    // })
  });
});
