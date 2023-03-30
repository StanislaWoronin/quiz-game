import { AnswerStatus } from '../../shared/answer-status';

export class SendAnswerDto {
  userId: string;
  answer: string;
  gameId: string;
  questionsId: string;
  answerStatus: AnswerStatus;
  isLastQuestions: boolean;

  constructor(
    userId: string,
    answer: string,
    gameId: string,
    questionsId: string,
    answerStatus: boolean,
    isLastQuestions: boolean,
  ) {
    this.userId = userId;
    this.answer = answer;
    this.gameId = gameId;
    this.questionsId = questionsId;
    this.answerStatus = this.getAnswerStatus(answerStatus);
    this.isLastQuestions = isLastQuestions;
  }

  private getAnswerStatus(answerStatus): AnswerStatus {
    if (!answerStatus) {
      return AnswerStatus.Incorrect;
    }
    return AnswerStatus.Correct;
  }
}
