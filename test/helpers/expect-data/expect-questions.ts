import { preparedQuestions } from '../prepeared-data/prepared-questions';

export const expectCreatedQuestion = {
  id: expect.any(String),
  body: preparedQuestions.valid.body,
  correctAnswers: preparedQuestions.valid.correctAnswers,
  published: preparedQuestions.published.default,
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};
