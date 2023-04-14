import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PublishedStatus } from './published-status';
import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { SortByQuestionsField } from './quesions-sort-field';
import { SortDirection } from '../../../../../../common/pagination/query-parameters/sort-direction';

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

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;
}
