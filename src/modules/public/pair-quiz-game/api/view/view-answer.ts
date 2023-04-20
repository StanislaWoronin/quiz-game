import { AnswerStatus } from '../../shared/answer-status';
import {ApiProperty} from "@nestjs/swagger";

export class ViewAnswer {
  @ApiProperty()
  questionId: string;
  @ApiProperty()
  answerStatus: AnswerStatus;
  @ApiProperty({example: '2023-04-20T10:45:05.185Z',})
  addedAt: string;

  constructor(questionId: string, answerStatus: AnswerStatus, addedAt: string) {
    this.questionId = questionId;
    this.answerStatus = answerStatus;
    this.addedAt = addedAt;
  }
}
