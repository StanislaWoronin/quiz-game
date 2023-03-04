import { CreatedQuestions } from "../../../src/modules/questions/api/view/created-questions";
import request from 'supertest';
import { endpoints } from "../routing/routing";

export class Questions {
  constructor(private readonly server: any) {
  }

  async createQuestion(
    superUser: {login: string, password: string},
    dto: {body: string, correctAnswers: string[]} ): Promise<{ body: CreatedQuestions, status: number }> {

    const response = await request(this.server)
      .post(endpoints.sa.quiz.questions)
      .auth(superUser.login, superUser.password, {
        type: 'basic',
      })
      .send(dto)

    return {body: response.body, status: response.status}
  }
}