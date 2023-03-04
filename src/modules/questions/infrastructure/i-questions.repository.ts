import { NewQuestionDto } from "../applications/dto/new-question.dto";
import { CreatedQuestions } from "../api/view/created-questions";

export interface IQuestionsRepository {
  createQuestion(newQuestion: NewQuestionDto): Promise<CreatedQuestions | null>
}

export const IQuestionsRepository ='IQuestionsRepository'