import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PublishedStatus } from './published-status';
import { SortByField } from '../../../../../../shared/pagination/query-parameters/sort-by-field';
import { Type } from 'class-transformer';
import { SortDirection } from '../../../../../../shared/pagination/query-parameters/sort-direction';
import {QueryDto} from "../../../../../../shared/dto/query.dto";

export class QuestionsQueryDto extends QueryDto {
  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;

  @IsEnum(PublishedStatus)
  @IsOptional()
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
