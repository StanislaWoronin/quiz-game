import { GameStatus } from '../../../shared/game-status';
import { AnswerStatus } from '../../../shared/answer-status';
import { ViewGame } from '../../../api/view/view-game';

export class GameDb {
  id: string;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
  firstUser: {
    id: string;
    login: string;
  };
  firstUserHost: boolean; // if true the first user is first player
  secondUser: {
    id: string;
    login: string;
  };
  firstUserScore: number;
  secondUserScore: number;
  firstUserAnswers: {
    questionId: string;
    answerStatus: AnswerStatus;
    addedAt: string;
  }[];
  secondUserAnswers: {
    questionId: string;
    answerStatus: AnswerStatus;
    addedAt: string;
  }[];
  questions: {
    id: string;
    body: string;
  }[];

  toViewModel(games: GameDb[]): ViewGame[] {
    return games.map(
      ({
        id,
        firstUserHost,
        firstUser,
        secondUser,
        firstUserAnswers,
        secondUserAnswers,
        firstUserScore,
        secondUserScore,
        questions,
        status,
        pairCreatedDate,
        startGameDate,
        finishGameDate,
      }) => {
        const firstPlayerProgress = firstUserHost
          ? {
              player: firstUser,
              answers: firstUserAnswers ?? [],
              score: firstUserScore,
            }
          : {
              player: secondUser,
              answers: secondUserAnswers ?? [],
              score: secondUserScore,
            };

        let secondPlayerProgress = null;
        if (secondUser.id) {
          secondPlayerProgress = firstUserHost
            ? {
                player: secondUser,
                answers: secondUserAnswers ?? [],
                score: secondUserScore,
              }
            : {
                player: firstUser,
                answers: firstUserAnswers ?? [],
                score: firstUserScore,
              };
        }

        return {
          id: id,
          firstPlayerProgress,
          secondPlayerProgress,
          questions:
            status === GameStatus.PendingSecondPlayer ? null : questions,
          status: status,
          pairCreatedDate: pairCreatedDate,
          startGameDate: startGameDate,
          finishGameDate: finishGameDate,
        };
      },
    );
  }
}
