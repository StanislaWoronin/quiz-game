import {ViewGame} from "../../../src/modules/public/pair-quiz-game/api/view/view-game";
import {ViewUserStatistic} from "../../../src/modules/public/pair-quiz-game/api/view/view-user-statistic";
import {GameStatsType} from "./game-stats.type";

export enum GameStats {
    Win = 'win',
    Lose = 'lose',
    Draw = 'draw'
}

export class FinishedGameType {
    accessToken: string;
    expectGame: ViewGame
    fistUserStat: GameStatsType
}

export class FinishedGamesType {
    accessToken: string;
    expectGames: ViewGame[]
    playerStats: ViewUserStatistic
}