import {GameDb} from "../../modules/public/pair-quiz-game/infrastructure/sql/pojo/game.db";
import {ViewGame} from "../../modules/public/pair-quiz-game/api/view/view-game";
import {Questions} from "../../modules/public/pair-quiz-game/shared/questions";
import {ViewAnswer} from "../../modules/public/pair-quiz-game/api/view/view-answer";

export const toViewGame = (game: GameDb[]): ViewGame => {
    const questions = getQuestions(game.slice(0,5))
    const score = getScore(game[4], game[9])

    return {
        id: game[0].id,
            firstPlayerProgress: {
            answers: getAnswers(game.slice(0,5)),
            player: {
                id: game[0].userId,
                login: game[0].login
            },
            score: score.firstScore
        },
        secondPlayerProgress: {
            answers: getAnswers(game.slice(5, 10)),
            player: {
                id: game[5].userId,
                login: game[5].login
            },
            score: score.secondScore
        },
        questions,
        status: game[0].status,
        pairCreatedDate: game[0].pairCreatedDate,
        startGameDate: game[0].startGameDate,
        finishGameDate: game[0].finishGameDate,
    }
}

const getQuestions = (game: GameDb[]): Questions[] => {
    const questions = []
    game.map(g => {
        questions.push({
            id: g.questionId,
            body: g.body
        });
    });

    return questions
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

const getScore = (firstPlayerProgress: GameDb, secondPlayerProgress: GameDb): { firstScore: number, secondScore: number } => {
    if (!firstPlayerProgress.addedAt && !secondPlayerProgress.addedAt) {
        return {
            firstScore: firstPlayerProgress.score, secondScore: secondPlayerProgress.score
        }
    }
    if (!firstPlayerProgress.addedAt) {
        return {
            firstScore: firstPlayerProgress.score, secondScore: secondPlayerProgress.score + 1
        }
    }
    if (!secondPlayerProgress.addedAt) {
        return {
            firstScore: firstPlayerProgress.score + 1, secondScore: secondPlayerProgress.score
        }
    }
    if (new Date(firstPlayerProgress.addedAt) > new Date(secondPlayerProgress.addedAt)) {
        return {
            firstScore: firstPlayerProgress.score, secondScore: secondPlayerProgress.score + 1
        }
    }
    if (new Date(firstPlayerProgress.addedAt) < new Date(secondPlayerProgress.addedAt)) {
        return {
            firstScore: firstPlayerProgress.score + 1, secondScore: secondPlayerProgress.score
        }
    }
}