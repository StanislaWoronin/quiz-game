import { CreatedQuestions } from "../../src/modules/questions/api/view/created-questions";
import { CreateQuestionDto } from "../../src/modules/questions/api/dto/create-question.dto";
import { faker } from "@faker-js/faker";
import { Questions } from "./request/questions";
import { preparedSuperUser } from "./prepeared-data/prepared-super-user";

export class Factories {
  constructor(private questions: Questions) {}

  getErrorsMessage(fields: string[]) {
    const errorsMessages = [];

    for (let i = 0, length = fields.length; i < length; i++) {
      errorsMessages.push({
        message: expect.any(String),
        field: fields[i],
      });
    }

    return errorsMessages;
  }

  async createQuestions(questionsCount: number): Promise<CreatedQuestions[]> {
    const result = [];

    for (let i = 0; i < questionsCount; i++) {
      const inputData: CreateQuestionDto = {
        body:  `${i}${faker.random.alpha(9)}`,
        correctAnswers: [
          `${1}${faker.random.alpha(3)}`,
          `${2}${faker.random.alpha(3)}`,
          `${3}${faker.random.alpha(3)}`
        ]
      };
      console.log(i)
      const response = await this.questions.createQuestion(preparedSuperUser.valid, inputData)

      result.push(response.body)
    }

    return result
  }
}
