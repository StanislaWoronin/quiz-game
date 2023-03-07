import { CreatedQuestionsDb } from "../../modules/questions/infrastructure/sql/pojo/created-questions.db";
import {CreatedQuestions} from "../../modules/questions/api/view/created-questions";

export const toCreatedQuestions = (
  createdQuestions: CreatedQuestionsDb,
  answers: string[]
): CreatedQuestions => {
  return {
    id: createdQuestions.id,
    body: createdQuestions.body,
    correctAnswers: answers,
    published: createdQuestions.published,
    createdAt: createdQuestions.createdAt,
    updatedAt: createdQuestions.updatedAt,
  }
}