import { CreatedQuestionsDb } from "../../modules/questions/infrastructure/sql/pojo/created-questions.db";

export const toCreatedQuestions = (
  createdQuestions: CreatedQuestionsDb,
  answers: string[]
) => {
  return {
    id: createdQuestions.id,
    body: createdQuestions.body,
    correctAnswers: answers,
    published: createdQuestions.published,
    createdAt: createdQuestions.createdAt,
    updatedAt: createdQuestions.updatedAt,
  }
}