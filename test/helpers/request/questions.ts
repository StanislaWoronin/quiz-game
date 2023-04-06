import { CreatedQuestions } from '../../../src/modules/sa/questions/api/view/created-questions';
import request from 'supertest';
import { endpoints } from '../routing/routing';
import { ViewPage } from '../../../src/common/pagination/view-page';
import { getUrlWithQuery } from '../routing/get-url/url-with-query';
import { UpdateQuestionDto } from '../../../src/modules/sa/questions/api/dto/update-question.dto';
import { getUrlWithId } from '../routing/get-url/url-with-id';
import { UpdatePublishStatusDto } from '../../../src/modules/sa/questions/api/dto/update-publish-status.dto';
import { getUrlForUpdatePublishStatus } from '../routing/get-url/questions-url';
import { ErrorsMessages } from '../../../src/common/dto/errors-messages';
import { SortByUserField } from '../../../src/modules/sa/users/api/dto/query/users-sort-field';
import { SortDirection } from '../../../src/common/pagination/query-parameters/sort-direction';
import { PublishedStatus } from '../../../src/modules/sa/questions/api/dto/query/published-status';
import { TestsPaginationType } from '../type/pagination/pagination.type';
import { TestingRequestDto } from '../testing-request.dto';
import { CreateQuestionDto } from '../../../src/modules/sa/questions/api/dto/create-question.dto';
import { SortByQuestionsField } from '../../../src/modules/sa/questions/api/dto/query/quesions-sort-field';

export class Questions {
  constructor(private readonly server: any) {}

  async createQuestion(
    superUser: { login: string; password: string },
    dto: { body: string; correctAnswers: string[] } | CreateQuestionDto[],
  ): Promise<TestingRequestDto<CreatedQuestions>> {
    const response = await request(this.server)
      .post(endpoints.sa.quiz.questions)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      })
      .send(dto);

    return { body: response.body, status: response.status };
  }

  async getQuestions(
    superUser: { login: string; password: string },
    {
      bodySearchTerm = null,
      sortBy = SortByQuestionsField.CreatedAt,
      sortDirection = SortDirection.Descending,
      publishedStatus = PublishedStatus.All,
      pageNumber = 1,
      pageSize = 10,
    }: TestsPaginationType<SortByQuestionsField>,
  ): Promise<{ body: ViewPage<CreatedQuestions>; status: number }> {
    const query = {
      bodySearchTerm,
      sortBy,
      sortDirection,
      publishedStatus,
      pageNumber,
      pageSize,
    };

    const url = getUrlWithQuery(endpoints.sa.quiz.questions, query);
    const response = await request(this.server)
      .get(url)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      });

    return { body: response.body, status: response.status };
  }

  async updateQuestion(
    superUser: { login: string; password: string },
    questionId: string,
    dto: UpdateQuestionDto,
  ): Promise<TestingRequestDto<ErrorsMessages>> {
    const url = getUrlWithId(endpoints.sa.quiz.questions, questionId);

    const response = await request(this.server)
      .put(url)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      })
      .send(dto);

    return { body: response.body, status: response.status };
  }

  async updateQuestionStatus(
    superUser: { login: string; password: string },
    questionId: string,
    dto: UpdatePublishStatusDto,
  ): Promise<TestingRequestDto<ErrorsMessages>> {
    const url = getUrlForUpdatePublishStatus(questionId);

    const response = await request(this.server)
      .put(url)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      })
      .send(dto);

    return { body: response.body, status: response.status };
  }

  async deleteQuestion(
    superUser: { login: string; password: string },
    questionId: string,
  ): Promise<number> {
    const url = getUrlWithId(endpoints.sa.quiz.questions, questionId);

    const response = await request(this.server)
      .delete(url)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      });

    return response.status;
  }
}
