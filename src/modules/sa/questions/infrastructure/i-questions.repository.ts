import { CreatedQuestions } from '../api/view/created-questions';
import { UpdateQuestionDto } from '../api/dto/update-question.dto';
import { CreateQuestionDto } from '../api/dto/create-question.dto';

export interface IQuestionsRepository {
  createQuestion(dto: CreateQuestionDto): Promise<CreatedQuestions | null>;
  updateQuestion(questionId: string, dto: UpdateQuestionDto): Promise<boolean>;
  updatePublishStatus(questionId: string, published: boolean): Promise<boolean>;
  deleteQuestion(questionId: string): Promise<boolean>;
}

export const IQuestionsRepository = 'IQuestionsRepository';
