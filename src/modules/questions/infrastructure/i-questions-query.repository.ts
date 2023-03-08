import { QueryParametersDto } from '../../../shared/pagination/query-parameters/query-parameters.dto';
import { ViewPage } from '../../../shared/pagination/view-page';
import { ViewQuestion } from "../api/view/view-question";

export interface IQuestionsQueryRepository {
  getAllQuestions(
    query: QueryParametersDto,
  ): Promise<ViewPage<ViewQuestion>>;
  questionExists(questionId: string): Promise<boolean | null>;
}

export const IQuestionsQueryRepository = 'IQuestionsQueryRepository';
