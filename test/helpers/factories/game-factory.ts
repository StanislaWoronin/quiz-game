import {Game} from "../request/game";
import {TestAnswersType} from "../type/anwers.type";
import {AnswerStatus} from "../../../src/modules/public/pair-quiz-game/shared/answer-status";
import {faker} from "@faker-js/faker";
import {preparedGameData} from "../prepeared-data/prepared-game-data";
import {Questions} from "../../../src/modules/public/pair-quiz-game/shared/questions";

export class GameFactory {
    constructor(private game: Game) {
    }

    async sendCorrectAnswer(token: string, question: Questions) {
        const correctAnswer = preparedGameData
            .find(gameData => gameData.body === question.body)
            .correctAnswers[0]
        await this.game.sendAnswer(correctAnswer, token)
    }

    async sendManyAnswer(token: string, questions: Questions[], answers: TestAnswersType) {
        for (let key in answers) {
            if (key === "score") break
            if (answers[Number(key) - 1] === AnswerStatus.Incorrect) {
                await this.game.sendAnswer(faker.random.alpha(5), token)
            } else {
                const correctAnswer = preparedGameData
                    .find(gameData => gameData.body === questions[Number(key) - 1].body)
                    .correctAnswers[0]
                await this.game.sendAnswer(correctAnswer, token)
            }
        }

        return answers
    }
}