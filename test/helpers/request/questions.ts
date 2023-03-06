import { CreatedQuestions } from '../../../src/modules/questions/api/view/created-questions';
import request from 'supertest';
import { endpoints } from '../routing/routing';
import { ViewPage } from '../../../src/shared/pagination/view-page';
import { getUrlWithQuery } from '../routing/helpers/url-with-query';
import { Query } from "../routing/query";
import {UpdateQuestionDto} from "../../../src/modules/questions/api/dto/update-question.dto";
import {ErrorsMessages} from "../../../src/shared/errors-messages";
import {getUrlWithId} from "../routing/helpers/url-with-id";
import {UpdatePublishStatusDto} from "../../../src/modules/questions/api/dto/update-publish-status.dto";
import {getUrlForUpdatePublishStatus} from "../routing/helpers/questions-url";

export class Questions {
  constructor(private readonly server: any) {}

  async createQuestion(
    superUser: { login: string; password: string },
    dto: { body: string; correctAnswers: string[] },
  ): Promise<{ body: CreatedQuestions; status: number }> {
    const response = await request(this.server)
      .post(endpoints.sa.quiz.questions)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      })
      .send(dto);

    return { body: response.body, status: response.status };
  }

  async getAllQuestions(
    superUser: { login: string; password: string },
    query?: Query,
  ): Promise<{ body: ViewPage<CreatedQuestions>; status: number }> {
    let url = endpoints.sa.quiz.questions;
    if (query) {
      url = getUrlWithQuery(endpoints.sa.quiz.questions, query);
    }

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
      dto: UpdateQuestionDto
  ): Promise<{ body: ErrorsMessages, status: number }> {
    const url = getUrlWithId(endpoints.sa.quiz.questions, questionId)

    const response = await request(this.server)
        .put(url)
        .auth(superUser.login, superUser.password, {
          type: 'basic'
        })
        .send(dto)

    return { body: response.body, status: response.status };
  }

  async updateQuestionStatus(
      superUser: { login: string; password: string },
      questionId: string,
      dto: UpdatePublishStatusDto
  ): Promise<{ body: ErrorsMessages, status: number }> {
    const url = getUrlForUpdatePublishStatus(questionId)

    const response = await request(this.server)
        .put(url)
        .auth(superUser.login, superUser.password, {
          type: 'basic'
        })
        .send(dto)

    return { body: response.body, status: response.status };
  }
}
