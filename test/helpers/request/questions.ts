import { CreatedQuestions } from '../../../src/modules/questions/api/view/created-questions';
import request from 'supertest';
import { endpoints } from '../routing/routing';
import { ViewPage } from '../../../src/shared/pagination/view-page';
import { getUrlWithQuery } from '../routing/create-url';
import { Query } from "../routing/query";

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
}
