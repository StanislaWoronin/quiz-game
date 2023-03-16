import { QuestionsQueryDto } from '../api/dto/query/questions-query.dto';
import { ViewPage } from '../../../../common/pagination/view-page';
import { ViewQuestion } from '../api/view/view-question';

export interface IQuestionsQueryRepository {
  getQuestions(query: QuestionsQueryDto): Promise<ViewPage<ViewQuestion>>;
  questionExists(questionId: string): Promise<boolean | null>;
}

export const IQuestionsQueryRepository = 'IQuestionsQueryRepository';
