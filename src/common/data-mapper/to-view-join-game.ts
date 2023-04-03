import { SimpleGameDb } from '../../modules/public/pair-quiz-game/infrastructure/sql/pojo/simpleGameDb';
import { ViewGame } from '../../modules/public/pair-quiz-game/api/view/view-game';
import { Questions } from '../../modules/public/pair-quiz-game/shared/questions';

export const toViewJoinGame = (game: SimpleGameDb[]): ViewGame => {
  const questions = getQuestions(game.slice(0, 5));

  return {
    id: game[0].id,
    firstPlayerProgress: {
      answers: [],
      player: {
        id: game[0].userId,
        login: game[0].login,
      },
      score: 0,
    },
    secondPlayerProgress: {
      answers: [],
      player: {
        id: game[5].userId,
        login: game[5].login,
      },
      score: 0,
    },
    questions,
    status: game[0].status,
    pairCreatedDate: game[0].pairCreatedDate,
    startGameDate: game[0].startGameDate,
    finishGameDate: game[0].finishGameDate,
  };
};

const getQuestions = (game: SimpleGameDb[]): Questions[] => {
  const questions = [];
  game.map((g) => {
    questions.push({
      id: g.questionId,
      body: g.body,
    });
  });

  return questions;
};
