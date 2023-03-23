import { AnswerStatus } from '../../shared/answer-status';

export class ViewAnswer {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;

  constructor(questionId: string, answerStatus: AnswerStatus, addedAt: string) {
    this.questionId = questionId
    this.answerStatus = answerStatus
    this.addedAt = addedAt
  }
}
