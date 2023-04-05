import { Game } from '../request/game';
import { TestAnswersType } from '../type/anwers.type';
import { AnswerStatus } from '../../../src/modules/public/pair-quiz-game/shared/answer-status';
import { faker } from '@faker-js/faker';
import { preparedGameData } from '../prepeared-data/prepared-game-data';
import { Questions } from '../../../src/modules/public/pair-quiz-game/shared/questions';
import {UsersFactory} from "./users-factory";
import {UserWithTokensType} from "../type/user-with-token-type";
import {TestingRequestDto} from "../testing-request.dto";
import {ViewGame} from "../../../src/modules/public/pair-quiz-game/api/view/view-game";
import {expectPlayerProgress, expectViewGame} from "../expect-data/expect-game";
import {GameStatus} from "../../../src/modules/public/pair-quiz-game/shared/game-status";
import {ViewAnswer} from "../../../src/modules/public/pair-quiz-game/api/view/view-answer";

export class GameFactory {
  constructor(private game: Game,
              private usersFactory: UsersFactory) {}

  async sendCorrectAnswer(token: string, question: Questions): Promise<TestingRequestDto<ViewAnswer>> {
    const correctAnswer = preparedGameData.find(
      (gameData) => gameData.body === question.body,
    ).correctAnswers[0];
    const response = await this.game.sendAnswer(correctAnswer, token);

    return {body: response.body, status: response.status}
  }

  async sendManyAnswer(
    token: string,
    questions: Questions[],
    answers: TestAnswersType,
  ) {
    for (const key in answers) {
      if (answers[Number(key)] === AnswerStatus.Incorrect) {
        await this.game.sendAnswer(faker.random.alpha(5), token);
      } else {
        const correctAnswer = preparedGameData.find(
          (gameData) => gameData.body === questions[Number(key) - 1].body,
        ).correctAnswers[0];
        await this.game.sendAnswer(correctAnswer, token);
      }
    }

    return answers;
  }

  async createGame(firstPlayer?: UserWithTokensType, secondPlayer?: UserWithTokensType): Promise<TestingRequestDto<ViewGame>> {
    if (!firstPlayer || !secondPlayer) {
      const [firstPlayer, secondPlayer] = await this.usersFactory.createAndLoginUsers(2)
    }
    await this.game.joinGame(firstPlayer.accessToken)

    return await this.game.joinGame(secondPlayer.accessToken)
  }

  async createFinishedGame(
      first?: UserWithTokensType,
      startFrom: number = 1,
  ): Promise<{ accessToken: string, expectGame: ViewGame }> {
    let firstUser = first
    if (!firstUser) {
      const [first] = await this.usersFactory.createAndLoginUsers(1)
      firstUser = first
    }

    const [secondUser] = await this.usersFactory.createAndLoginUsers(1, startFrom)

    const draw = this.eagleAndTails()
    const firstPlayer = draw ? firstUser : secondUser
    const secondPlayer =  draw ? secondUser : firstUser

    const game = await this.createGame(firstPlayer, secondPlayer)

    const firstPlayerAnswers = this.getAnswersStatus()
    await this.sendManyAnswer(
        firstPlayer.accessToken,
        game.body.questions,
        firstPlayerAnswers
    )

    const secondPlayerAnswers = this.getAnswersStatus()
    await this.sendManyAnswer(
        secondPlayer.accessToken,
        game.body.questions,
        secondPlayerAnswers
    )

    const viewGame = expectViewGame({
          first: expectPlayerProgress(
              firstPlayer.user,
              firstPlayerAnswers,
              this.getScore(firstPlayerAnswers, true)
          ),
          second: expectPlayerProgress(
              secondPlayer.user,
              secondPlayerAnswers,
              this.getScore(secondPlayerAnswers)
          )
        },
        GameStatus.Finished,
        game.body.questions
    )

    return { accessToken: firstUser.accessToken, expectGame: viewGame }
  }

  async createFinishedGames(gamesCount: number, startFrom: number = 1, firstUser?: UserWithTokensType): Promise<{ accessToken: string, expectGames: ViewGame[] }> {
    const expectGames = []
    for (let i = 0; i < gamesCount; i++) {
      const viewGame = await this.createFinishedGame(firstUser, startFrom + i)
      expectGames.push(viewGame.expectGame)
    }
    return { accessToken: firstUser.accessToken, expectGames: expectGames }
  }

  private eagleAndTails(): number {
    return  Math.round(Math.random())
  }

  private getAnswerStatus(): AnswerStatus {
    return this.eagleAndTails() ? AnswerStatus.Correct : AnswerStatus.Incorrect
  }

  private getAnswersStatus(): TestAnswersType {
    return {
    1: this.getAnswerStatus(),
    2: this.getAnswerStatus(),
    3: this.getAnswerStatus(),
    4: this.getAnswerStatus(),
    5: this.getAnswerStatus(),
    }
  }

  private getScore(answers: TestAnswersType, first?: boolean): number {
    let score = 0
    for (let answer in answers) {
      if (answers[Number(answer)] === AnswerStatus.Correct) {
        score++

      }
    }
    if (first && score !== 0) {
      score++
    }

    return score
  }
}
