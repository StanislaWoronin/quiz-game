import { ViewGame } from '../api/view/view-game';
import { PlayerIdDb } from './sql/pojo/player-id.db';
import { GetCorrectAnswerDb } from './sql/pojo/get-correct-answer.db';
import { GameStatus } from '../shared/game-status';
import { ViewPage } from '../../../../common/pagination/view-page';
import { GameQueryDto } from '../api/dto/query/game-query.dto';
import { ViewUserStatistic } from '../api/view/view-user-statistic';
import { ViewTopPlayers } from '../api/view/view-top-players';
import { TopPlayersQueryDto } from '../api/dto/query/top-players-query.dto';
import { GameWhichNeedComplete } from './sql/pojo/game-which-need-complete';

export interface IQuizGameQueryRepository {
  getMyCurrentGame(userId: string): Promise<ViewGame | null>;
  getGameById(userId: string, gameId: string): Promise<ViewGame>;
  getMyGames(userId, queryDto: GameQueryDto): Promise<ViewPage<ViewGame>>;
  getPlayerByGameId(gameId: string): Promise<PlayerIdDb[]>;
  getCorrectAnswers(
    gameId: string,
    questionNumber: number,
  ): Promise<GetCorrectAnswerDb>;
  getUserStatistic(userId: string): Promise<ViewUserStatistic>;
  getTopPlayers(query: TopPlayersQueryDto): Promise<ViewPage<ViewTopPlayers>>;
  checkUserCurrentGame(
    userId: string,
    status?: GameStatus,
  ): Promise<string | null>;
  checkOpenGame(): Promise<string | null>;
  currentGameAnswerProgress(userId: string, gameId: string): Promise<number>;
  //findGamesWhichNeedComplete(currentTime: string): Promise<GameWhichNeedComplete[]>
}

export const IQuizGameQueryRepository = 'IQuizGameQueryRepository';
