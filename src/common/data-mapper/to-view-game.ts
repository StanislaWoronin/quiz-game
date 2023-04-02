import { GameDb } from '../../modules/public/pair-quiz-game/infrastructure/sql/pojo/game.db';
import { ViewGame } from '../../modules/public/pair-quiz-game/api/view/view-game';
import { Questions } from '../../modules/public/pair-quiz-game/shared/questions';
import { ViewAnswer } from '../../modules/public/pair-quiz-game/api/view/view-answer';
import { ViewGameProgress } from '../../modules/public/pair-quiz-game/api/view/view-game-progress';
import { GameStatus } from '../../modules/public/pair-quiz-game/shared/game-status';

export const toViewGame = (games: GameDb[]): ViewGame => {
  const questions = getQuestions(games.slice(0, 5));

  //const extraScore = getExtraScore(games)

  return {
    id: games[0].id,
    firstPlayerProgress: getPlayerProgress(games.slice(0, 5)),
    secondPlayerProgress: getPlayerProgress(games.slice(5, 10)),
    questions,
    status: games[0].status,
    pairCreatedDate: games[0].pairCreatedDate,
    startGameDate: games[0].startGameDate,
    finishGameDate: games[0].finishGameDate,
  };
};

const getQuestions = (games: GameDb[]): Questions[] => {
  if (games[0].status === GameStatus.PendingSecondPlayer) {
    return null;
  }
  const questions = [];
  games.map((g) => {
    questions.push({
      id: g.questionId,
      body: g.body,
    });
  });

  return questions;
};

const getPlayerProgress = (games: GameDb[]): ViewGameProgress | null => {
  if (!games.length) {
    return null;
  }

  return {
    answers: getAnswers(games),
    player: {
      id: games[0].userId,
      login: games[0].login,
    },
    score: games[0].score,
  };
};

const getAnswers = (games: GameDb[]): ViewAnswer[] => {
  if (!games[0].addedAt) return [];

  const answers = [];
  games.map((g) => {
    if (g.addedAt) {
      answers.push({
        questionId: g.questionId,
        answerStatus: g.answerStatus,
        addedAt: g.addedAt,
      });
    }
  });

  return answers;
};

// const getExtraScore = (games: GameDb[]): number[]  => {
//   if (games.length === 5) {
//     return [0, 0]
//   }
//
//   if (!games[4].addedAt || !games[9].addedAt) {
//     return [0, 0]
//   }
//
//   if (games[0].score !== 0 && games[4].addedAt < games[9].addedAt) {
//     return [1, 0]
//   }
//
//   if (games[5].score !== 0 && games[4].addedAt > games[9].addedAt) {
//     return [0, 1]
//   }
//
//   return [0, 0]
// }
