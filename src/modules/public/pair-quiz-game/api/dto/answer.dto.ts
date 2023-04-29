import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty()
  @IsString()
  answer: string;
}
