import {GameDb} from "../../modules/public/pair-quiz-game/infrastructure/sql/pojo/game.db";
import {ViewGame} from "../../modules/public/pair-quiz-game/api/view/view-game";
import {Questions} from "../../modules/public/pair-quiz-game/shared/questions";
import {ViewAnswer} from "../../modules/public/pair-quiz-game/api/view/view-answer";
import {ViewGameProgress} from "../../modules/public/pair-quiz-game/api/view/view-game-progress";
import {GameStatus} from "../../modules/public/pair-quiz-game/shared/game-status";

export const toViewGame = (game: GameDb[]): ViewGame => {
    const questions = getQuestions(game.slice(0,5))

    console.log(game[0].pairCreatedDate, 'from repo')
    return {
        id: game[0].id,
        firstPlayerProgress: getPlayerProgress(game.slice(0, 5)),
        secondPlayerProgress: getPlayerProgress(game.slice(5, 10)),
        questions,
        status: game[0].status,
        pairCreatedDate: game[0].pairCreatedDate,
        startGameDate: game[0].startGameDate,
        finishGameDate: game[0].finishGameDate,
    }
}

const getQuestions = (game: GameDb[]): Questions[] => {
    if (game[0].status === GameStatus.PendingSecondPlayer) {
        return null
    }
    const questions = []
    game.map(g => {
        questions.push({
            id: g.questionId,
            body: g.body
        });
    });

    return questions
}

const getPlayerProgress = (game: GameDb[]): ViewGameProgress | null => {
    if (!game.length) {
        return null
    }

    return {
        answers: getAnswers(game),
        player: {
            id: game[0].userId,
            login: game[0].login
        },
        score: game[0].score
    }
}

const getAnswers = (game: GameDb[]): ViewAnswer[] => {
    if (!game[0].addedAt) return []

    const answers = []
    game.map(g => {
        if (g.addedAt) {
            answers.push({
                questionId: g.questionId,
                answerStatus: g.answerStatus,
                addedAt: g.addedAt
            })
        }
    })

    return answers
}