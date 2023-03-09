import { QuestionsQueryDto } from '../../modules/sa/questions/api/dto/query/questions-query.dto';

export class PageDto<I> {
  items: I[];
  query: QuestionsQueryDto;
  totalCount: number;
}
