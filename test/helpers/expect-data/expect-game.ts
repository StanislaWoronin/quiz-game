import { ViewGame } from "../../../src/modules/public/pair-quiz-game/api/view/view-game";
import { ViewAnswer } from "../../../src/modules/public/pair-quiz-game/api/view/view-answer";
import { AnswerStatus } from "../../../src/modules/public/pair-quiz-game/shared/answer-status";
import { TestAnswersType } from "../type/anwers.type";
import { CreatedUser } from "../../../src/modules/sa/users/api/view/created-user";
import { ViewGameProgress } from "../../../src/modules/public/pair-quiz-game/api/view/view-game-progress";
import { MemberType } from "../type/member.type";
import { Questions } from "../../../src/modules/public/pair-quiz-game/shared/questions";
import { GameStatus } from "../../../src/modules/public/pair-quiz-game/shared/game-status";
import { CreatedQuestions } from "../../../src/modules/sa/questions/api/view/created-questions";

export const expectViewGame = (member: MemberType, status: GameStatus, questionsArray?: Questions[], score?: number): ViewGame => {
    let items = null
    if (status !== GameStatus.PendingSecondPlayer) {
        items = questions()
    }
    let startGameDate = null
    if (status === GameStatus.Active || status === GameStatus.Finished) {
        startGameDate = expect.any(String)
    }
    let finishGameDate = null
    if (status === GameStatus.Finished) {
        finishGameDate = expect.any(String)
    }

    return {
        id: expect.any(String),
        firstPlayerProgress: member.first,
        secondPlayerProgress: member.second ?? null,
        questions: items,
        status: status,
        pairCreatedDate: expect.any(String),
        startGameDate,
        finishGameDate
    }
}

export const expectAnswer = (answerStatus: AnswerStatus): ViewAnswer => {
    return {
        questionId: expect.any(String),
        answerStatus,
        addedAt: expect.any(String)
    }
}

export const expectPlayerProgress = (user: CreatedUser, answerStatus: TestAnswersType, score?): ViewGameProgress => {
    let answers = []
    for (let key in answerStatus) {
        answers.push(expectAnswer(answerStatus[key]))
    }

    return {
        answers,
        player: {
            id: user.id,
            login: user.login
        },
        score: score ?? 0
    }
}

export const expectQuestions = (questions: CreatedQuestions[]): Questions[] => {
    let result = []
    for (let i = 0, length = questions.length; i < length; i++) {
        result.push({
            id: questions[i].id,
            body: questions[i].body
        })
    }
    return result
}

const questions = () => {
    let result = []
    for (let i = 0; i < 5; i++) {
        result.push({
            id: expect.any(String),
            body: expect.any(String),
        })
    }
    return result
}