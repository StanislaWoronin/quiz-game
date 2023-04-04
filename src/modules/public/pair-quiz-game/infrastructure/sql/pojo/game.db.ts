import {GameStatus} from "../../../shared/game-status";
import {AnswerStatus} from "../../../shared/answer-status";
import {ViewGame} from "../../../api/view/view-game";

export class GameDb {
    id: string
    status: GameStatus
    pairCreatedDate: string
    startGameDate: string
    finishGameDate: string
    firstUser: {
        id: string
        login: string
    }
    firstUserHost: boolean // if true the first user is first player
    secondUser: {
        id: string
        login: string
    }
    firstPlayerScore: number
    secondPlayerScore: number
    firstUserAnswers: {
        questionId: string
        answerStatus: AnswerStatus
        addedAt: string
    }[]
    secondUserAnswers: {
        questionId: string
        answerStatus: AnswerStatus
        addedAt: string
    }[]
    questions: {
        id: string
        body: string
    }[]

    toViewModel(games: GameDb[]): ViewGame[] {
        const result = []
        for (let game of games) {
            const firstPlayerAnswer = game.firstUserHost ? game.firstUserAnswers : game.secondUserAnswers
            const secondPlayerAnswer = game.firstUserHost ? game.secondUserAnswers : game.firstUserAnswers

            result.push({
                id: game.id,
                firstPlayerProgress: {
                    player: game.firstUserHost ? game.firstUser : game.secondUser,
                    answers: firstPlayerAnswer ?? [],
                    score: game.firstUserHost ? game.firstPlayerScore : game.secondPlayerScore
                },
                secondPlayerProgress: {
                    player: game.firstUserHost ? game.secondUser : game.firstUser,
                    answers: secondPlayerAnswer ?? [],
                    score: game.firstUserHost ? game.secondPlayerScore : game.firstPlayerScore
                },
                questions: game.questions,
                status: game.status,
                pairCreatedDate: game.pairCreatedDate,
                startGameDate: game.startGameDate,
                finishGameDate: game.finishGameDate
            })
        }

        return result
    }
}