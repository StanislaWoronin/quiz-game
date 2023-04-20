import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePublishStatusDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
