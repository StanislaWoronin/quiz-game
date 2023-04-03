import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PublishedStatus } from './published-status';
import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import {SortByQuestionsField} from "./quesions-sort-field";

export class QuestionsQueryDto extends QueryDto {
  @IsString()
  @IsOptional()
  bodySearchTerm: string | null;

  @IsEnum(PublishedStatus)
  @IsOptional()
  publishedStatus: PublishedStatus = PublishedStatus.All;

  @IsEnum(SortByQuestionsField)
  @IsOptional()
  sortBy: SortByQuestionsField = SortByQuestionsField.CreatedAt;
}
