import { preparedQuestions } from '../prepeared-data/prepared-questions';
import {CreatedQuestions} from "../../../src/modules/sa/questions/api/view/created-questions";

export const expectCreatedQuestion = (): CreatedQuestions => {
  return {
    id: expect.any(String),
    body: preparedQuestions.valid.body,
    correctAnswers: preparedQuestions.valid.correctAnswers,
    published: preparedQuestions.published.default,
    createdAt: expect.any(String),
    updatedAt: null,
  }
};


