import {
  IsArray,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { settings } from '../../../../../settings';

export class CreateQuestionDto {
  @ApiProperty({
    minLength: settings.validationConstant.questionsBodyLength.min,
    maxLength: settings.validationConstant.questionsBodyLength.max,
  })
  @IsString()
  @Length(
    settings.validationConstant.questionsBodyLength.min,
    settings.validationConstant.questionsBodyLength.max,
  )
  body: string;

  @ApiProperty({
    isArray: true,
    example: [
      'possible fist answer',
      'possible second answer',
      'possible third answer',
    ],
  })
  @IsArray()
  correctAnswers: string[];
}
