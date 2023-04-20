import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BanStatus } from './ban-status';
import { SortByUserField } from './users-sort-field';
import { SortDirection } from '../../../../../../common/pagination/query-parameters/sort-direction';
import {ApiProperty} from "@nestjs/swagger";

export class UsersQueryDto extends QueryDto {
  @ApiProperty({default: BanStatus.All, required: false})
  @IsEnum(BanStatus)
  @IsOptional()
  banStatus: BanStatus = BanStatus.All;

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  searchLoginTerm: string | null;

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  searchEmailTerm: string | null;

  @ApiProperty({default: SortByUserField.CreatedAt, required: false})
  @IsEnum(SortByUserField)
  @IsOptional()
  sortBy: SortByUserField = SortByUserField.CreatedAt;

  @ApiProperty({default: SortDirection.Descending, required: false})
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;
}
