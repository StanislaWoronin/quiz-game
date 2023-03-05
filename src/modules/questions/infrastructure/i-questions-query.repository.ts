import { QueryParametersDto } from '../../../shared/pagination/query-parameters/query-parameters.dto';
import { CreatedQuestions } from '../api/view/created-questions';
import { ViewPage } from '../../../shared/pagination/view-page';

export interface IQuestionsQueryRepository {
  getAllQuestions(
    query: QueryParametersDto,
  ): Promise<ViewPage<CreatedQuestions>>;
}

export const IQuestionsQueryRepository = 'IQuestionsQueryRepository';
