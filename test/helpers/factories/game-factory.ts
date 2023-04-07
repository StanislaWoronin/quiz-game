import { Game } from '../request/game';
import { TestAnswersType } from '../type/anwers.type';
import { AnswerStatus } from '../../../src/modules/public/pair-quiz-game/shared/answer-status';
import { faker } from '@faker-js/faker';
import { preparedGameData } from '../prepeared-data/prepared-game-data';
import { Questions } from '../../../src/modules/public/pair-quiz-game/shared/questions';
import { UsersFactory } from './users-factory';
import { UserWithTokensType } from '../type/auth/user-with-token-type';
import { TestingRequestDto } from '../testing-request.dto';
import { ViewGame } from '../../../src/modules/public/pair-quiz-game/api/view/view-game';
import {
  expectPlayerProgress,
  expectViewGame,
} from '../expect-data/expect-game';
import { GameStatus } from '../../../src/modules/public/pair-quiz-game/shared/game-status';
import { ViewAnswer } from '../../../src/modules/public/pair-quiz-game/api/view/view-answer';
import {ViewUserStatistic} from "../../../src/modules/public/pair-quiz-game/api/view/view-user-statistic";
import {getAvgScore} from "../../../src/common/helpers";
import {FinishedGamesType, FinishedGameType, GameStats} from "../type/finished-game.type";
import {GameStatsType} from "../type/game-stats.type";
import {CreateFinishedGameType} from "../type/create-finished-game.type";
import {ViewTopPlayers} from "../../../src/modules/public/pair-quiz-game/api/view/view-top-players";
import {ViewPlayer} from "../../../src/modules/public/pair-quiz-game/api/view/view-player";

export class GameFactory {
  constructor(private game: Game, private usersFactory: UsersFactory) {}

  async sendCorrectAnswer(
    token: string,
    question: Questions,
  ): Promise<TestingRequestDto<ViewAnswer>> {
    const correctAnswer = preparedGameData.find(
      (gameData) => gameData.body === question.body,
    ).correctAnswers[0];
    const response = await this.game.sendAnswer(correctAnswer, token);

    return { body: response.body, status: response.status };
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

  async createGame(
    firstPlayer?: UserWithTokensType,
    secondPlayer?: UserWithTokensType,
  ): Promise<TestingRequestDto<ViewGame>> {
    if (!firstPlayer || !secondPlayer) {
      const [firstPlayer, secondPlayer] =
        await this.usersFactory.createAndLoginUsers(2);
    }
    await this.game.joinGame(firstPlayer.accessToken);

    return await this.game.joinGame(secondPlayer.accessToken);
  }

  async createFinishedGame(
      {
        first,
        second,
        startFrom = 1
      }: CreateFinishedGameType,
  ): Promise<FinishedGameType> {
    let firstUser = first;
    if (!firstUser) {
      const [first] = await this.usersFactory.createAndLoginUsers(1);
      firstUser = first;
    }

    let secondUser = second
    if (!second) {
      const [second] = await this.usersFactory.createAndLoginUsers(
          1,
          startFrom,
      );
      secondUser = second
    }

    let firstPlayer = firstUser
    let secondPlayer = secondUser
    if (!first && !second) {
      const draw = this.eagleAndTails();
      firstPlayer = draw ? firstUser : secondUser;
      secondPlayer = draw ? secondUser : firstUser;
    }

    const game = await this.createGame(firstPlayer, secondPlayer);

    const firstPlayerAnswers = this.getAnswersStatus();
    await this.sendManyAnswer(
      firstPlayer.accessToken,
      game.body.questions,
      firstPlayerAnswers,
    );

    const secondPlayerAnswers = this.getAnswersStatus();
    await this.sendManyAnswer(
      secondPlayer.accessToken,
      game.body.questions,
      secondPlayerAnswers,
    );

    const viewGame = expectViewGame(
      {
        first: expectPlayerProgress(
          firstPlayer.user,
          firstPlayerAnswers,
          this.getScore(firstPlayerAnswers, true),
        ),
        second: expectPlayerProgress(
          secondPlayer.user,
          secondPlayerAnswers,
          this.getScore(secondPlayerAnswers),
        ),
      },
      GameStatus.Finished,
      game.body.questions,
    );

    const fistUserStat = this.checkStat(viewGame, firstUser.user.login)

    return { accessToken: firstUser.accessToken, expectGame: viewGame, fistUserStat };
  }

  async createFinishedGames(
    gamesCount: number,
    startFrom = 1,
    first?: UserWithTokensType,
  ): Promise<FinishedGamesType> {
    const expectGames = [];
    const playerStats: ViewUserStatistic = {
      sumScore: 0,
      avgScores: 0,
      gamesCount: 0,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 0
    }

    let firstUser = first;
    if (!firstUser) {
      const [first] = await this.usersFactory.createAndLoginUsers(1);
      firstUser = first;
    }

    for (let i = 0; i < gamesCount; i++) {
      const viewGame = await this.createFinishedGame({first: firstUser, startFrom: startFrom +i});
      expectGames.push(viewGame.expectGame);

      playerStats.sumScore += viewGame.fistUserStat.score
      playerStats.gamesCount++
      switch (viewGame.fistUserStat.gameStats) {
        case GameStats.Win:
          playerStats.winsCount++
          break;
        case GameStats.Lose:
          playerStats.lossesCount++
          break;
        case GameStats.Draw:
          playerStats.drawsCount++
      }
    }
    playerStats.avgScores = getAvgScore(playerStats.sumScore, playerStats.gamesCount)

    return { accessToken: firstUser.accessToken, expectGames: expectGames, playerStats };
  }

  async createPlayersTop(playersCount: number, gameRound: number): Promise<ViewTopPlayers[]> {
    const players = await this.usersFactory.createAndLoginUsers(playersCount)

    let gamesStats = []
    for (let i = 0; i < gameRound; i++) {
      const startFrom = (playersCount - 1) * (i + 1)
      const playerStats = await this.createFinishedGames(gameRound, startFrom, players[i])

      const userStats: ViewTopPlayers = {
        sumScore: playerStats.playerStats.sumScore,
        avgScores: playerStats.playerStats.avgScores,
        gamesCount: playerStats.playerStats.gamesCount,
        winsCount: playerStats.playerStats.winsCount,
        lossesCount: playerStats.playerStats.lossesCount,
        drawsCount: playerStats.playerStats.drawsCount,
        player: new ViewPlayer(players[i].user.id, players[i].user.login)
      }
      console.log(userStats)
      gamesStats.push(userStats)
    }

    return gamesStats
  }

  private eagleAndTails(randomRange: number = 2): number {
    return Math.round(Math.random() * (randomRange - 1));
  }

  private getAnswerStatus(): AnswerStatus {
    return this.eagleAndTails() ? AnswerStatus.Correct : AnswerStatus.Incorrect;
  }

  private getAnswersStatus(): TestAnswersType {
    return {
      1: this.getAnswerStatus(),
      2: this.getAnswerStatus(),
      3: this.getAnswerStatus(),
      4: this.getAnswerStatus(),
      5: this.getAnswerStatus(),
    };
  }

  private getScore(answers: TestAnswersType, first?: boolean): number {
    let score = 0;
    for (const answer in answers) {
      if (answers[Number(answer)] === AnswerStatus.Correct) {
        score++;
      }
    }
    if (first && score !== 0) {
      score++;
    }

    return score;
  }

  private checkStat(game: ViewGame, userLogin: string): GameStatsType {
    let firstUserScore
    let secondUserScore
    if (game.firstPlayerProgress.player.login === userLogin) {
      firstUserScore = game.firstPlayerProgress.score
      secondUserScore = game.secondPlayerProgress.score
    } else {
      firstUserScore = game.secondPlayerProgress.score
      secondUserScore = game.firstPlayerProgress.score
    }

    let firstUserGameStats
    if (firstUserScore > secondUserScore) {
      firstUserGameStats = GameStats.Win
    } else if (firstUserScore < secondUserScore) {
      firstUserGameStats = GameStats.Lose
    } else {
      firstUserGameStats = GameStats.Draw
    }

    return {score: firstUserScore, gameStats: firstUserGameStats}
  }
}