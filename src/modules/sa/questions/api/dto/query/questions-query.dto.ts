import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PublishedStatus } from './published-status';
import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { SortByQuestionsField } from './quesions-sort-field';
import { SortDirection } from '../../../../../../common/pagination/query-parameters/sort-direction';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionsQueryDto extends QueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bodySearchTerm: string | null;

  @ApiProperty({ default: PublishedStatus.All, required: false })
  @IsEnum(PublishedStatus)
  @IsOptional()
  publishedStatus: PublishedStatus = PublishedStatus.All;

  @ApiProperty({ default: SortByQuestionsField.CreatedAt, required: false })
  @IsEnum(SortByQuestionsField)
  @IsOptional()
  sortBy: SortByQuestionsField = SortByQuestionsField.CreatedAt;

  @ApiProperty({ default: SortDirection.Descending, required: false })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;
}
