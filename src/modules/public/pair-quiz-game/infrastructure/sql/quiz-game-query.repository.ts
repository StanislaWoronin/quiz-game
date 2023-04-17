import {IQuizGameQueryRepository} from '../i-quiz-game-query.repository';
import {GameStatus} from '../../shared/game-status';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {ViewGame} from '../../api/view/view-game';
import {PlayerIdDb} from './pojo/player-id.db';
import {GetCorrectAnswerDb} from './pojo/get-correct-answer.db';
import {ViewPage} from '../../../../../common/pagination/view-page';
import {GameDb} from './pojo/game.db';
import {GameQueryDto} from '../../api/dto/query/game-query.dto';
import {ViewUserStatistic} from '../../api/view/view-user-statistic';
import {ViewTopPlayers} from '../../api/view/view-top-players';
import {TopPlayersQueryDto} from '../../api/dto/query/top-players-query.dto';
import {GameWhichNeedComplete} from './pojo/game-which-need-complete';
import {settings} from '../../../../../settings';
import {gameQueryOptions} from '../helpers/game-query-options.type';

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async getMyGames(
    userId: string,
    queryDto: GameQueryDto,
  ): Promise<ViewPage<ViewGame>> {
    const query = this.getGameQuery({
      gameStatus: [GameStatus.Active, GameStatus.Finished],
      dto: queryDto,
    });
    const result: GameDb[] = await this.dataSource.query(query, [userId]);
    const games = new GameDb().toViewModel(result);

    const totalCountQuery = `
      SELECT COUNT(*)
        FROM sql_game g
        JOIN sql_game_progress fp ON g.id = fp."gameId" AND fp."userId" = $1
        JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != $1;
      `;
    const totalCount = await this.dataSource.query(totalCountQuery, [userId]);

    return new ViewPage<ViewGame>({
      items: games,
      query: queryDto,
      totalCount: Number(totalCount[0].count),
    });
  }

  async getMyCurrentGame(userId: string): Promise<ViewGame | null> {
    const query = this.getGameQuery({
      gameStatus: [GameStatus.PendingSecondPlayer, GameStatus.Active],
    });
    const result = await this.dataSource.query(query, [userId]);
    if (!result) {
      return null;
    }

    const game = new GameDb().toViewModel(result)[0];
    return game;
  }

  async getGameById(userId: string, gameId: string): Promise<ViewGame | null> {
    const query = this.getGameQuery({_gameIdFilter: true});
    const result = await this.dataSource.query(query, [userId, gameId]);
    if (!result[0]) {
      return null;
    }

    const game = new GameDb().toViewModel(result)[0];
    return game;
  }

  async getPlayerByGameId(gameId: string): Promise<PlayerIdDb[]> {
    const query = `
            SELECT "userId" AS "playerId"
              FROM sql_game_progress
             WHERE "gameId" = $1;
        `;
    return await this.dataSource.query(query, [gameId]);
  }

  async getCorrectAnswers(
    gameId: string,
    lastQuestionNumber: number,
  ): Promise<GetCorrectAnswerDb> {
    const query = `
            SELECT gq."questionId", q."correctAnswers"
              FROM sql_game_questions gq
              LEFT JOIN sql_questions q
                ON q.id = gq."questionId"
             WHERE gq."gameId" = $1
            OFFSET $2 LIMIT 1;
        `;
    const result = await this.dataSource.query(query, [
      gameId,
      lastQuestionNumber,
    ]);

    return result[0];
  }

  async getUserStatistic(userId: string): Promise<ViewUserStatistic> {
    try {
      const query = `
      SELECT COUNT(g.id) AS "gamesCount",
             CAST(COUNT(DISTINCT fp."gameId") AS INTEGER) AS "gamesCount",
             CAST(SUM(fp.score) AS INTEGER) AS "sumScore",
             CAST(SUM(CASE WHEN fp.score > sp.score THEN 1 ELSE 0 END) AS INTEGER) AS "winsCount",
             CAST(SUM(CASE WHEN fp.score < sp.score THEN 1 ELSE 0 END) AS INTEGER) AS "lossesCount",
             CAST(SUM(CASE WHEN fp.score = sp.score THEN 1 ELSE 0 END) AS INTEGER) AS "drawsCount",
             CAST(CASE 
                WHEN AVG(fp.score) % 1 = 0 
                THEN CAST(AVG(fp.score) AS INTEGER)
                ELSE CAST(ROUND(AVG(fp.score), 2) AS NUMERIC(10,2))
             END AS DOUBLE PRECISION) AS "avgScores"
        FROM sql_game g
        JOIN sql_game_progress fp ON g.id = fp."gameId" AND fp."userId" = $1
        JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != $1;
    `;
      const result: ViewUserStatistic[] = await this.dataSource.query(query, [
        userId,
      ]);
      console.log(result)
      result[0].avgScores = Number(result[0].avgScores); // TODO FIXIT

      return result[0];
    } catch (e) {
      console.log(e)
    }
  }

  async getTopPlayers(
    queryDto: TopPlayersQueryDto,
  ): Promise<ViewPage<ViewTopPlayers>> {
    const sortBy = this.getSortBy(queryDto.sort);

    const query = `
      SELECT JSON_BUILD_OBJECT('id', fp."userId", 'login', u.login) AS player,
             CAST(COUNT(DISTINCT fp."gameId") AS INTEGER) AS "gamesCount",
             CAST(SUM(fp.score) AS INTEGER) AS "sumScore",
             CAST(SUM(CASE WHEN fp.score > sp.score THEN 1 ELSE 0 END) AS INTEGER) AS "winsCount",
             CAST(SUM(CASE WHEN fp.score < sp.score THEN 1 ELSE 0 END) AS INTEGER) AS "lossesCount",
             CAST(SUM(CASE WHEN fp.score = sp.score THEN 1 ELSE 0 END) AS INTEGER) AS "drawsCount",
             CASE 
                WHEN AVG(fp.score) % 1 = 0 
                THEN CAST(AVG(fp.score) AS INTEGER)
                ELSE CAST(ROUND(AVG(fp.score), 2) AS NUMERIC(10,2))
             END AS "avgScores"
        FROM sql_game_progress fp
        JOIN sql_game_progress sp ON sp."gameId" = fp."gameId" AND sp."userId" != fp."userId"
        JOIN sql_users u ON u.id = fp."userId"
       GROUP BY fp."userId", u.login
       ${sortBy}
      OFFSET $1 LIMIT $2;
    `;
    const result: ViewTopPlayers[] = await this.dataSource.query(query, [
      queryDto.skip,
      queryDto.pageSize,
    ]);
    const res = result.map((r) => {
      return {
        player: r.player,
        gamesCount: r.gamesCount,
        sumScore: r.sumScore,
        avgScores: Number(r.avgScores),
        winsCount: r.winsCount,
        lossesCount: r.lossesCount,
        drawsCount: r.drawsCount,
      };
    }); // TODO FIXIT

    const totalCountQuery = `
      SELECT CAST(COUNT(*) AS INTEGER)
        FROM sql_users
       WHERE EXISTS(SELECT FROM sql_game_progress);   
    `;
    const totalCount = await this.dataSource.query(totalCountQuery);

    return new ViewPage<ViewTopPlayers>({
      items: res,
      query: queryDto,
      totalCount: totalCount[0].count,
    });
  }

  async checkUserCurrentGame(
    userId: string,
    status?: GameStatus,
  ): Promise<string | null> {
    let filter = `AND status != '${GameStatus.Finished}'`;
    if (status) {
      filter = `AND status = '${status}'`;
    }
    const query = `
            SELECT gp."gameId"
              FROM sql_game_progress gp
              LEFT JOIN sql_game g
                ON g.id = gp."gameId"
             WHERE "userId" = $1
               ${filter};
        `;
    const result = await this.dataSource.query(query, [userId]);

    if (!result.length) {
      return null;
    }

    return result[0].gameId;
  }

  async checkOpenGame(): Promise<string | null> {
    const query = ` 
            SELECT id FROM sql_game WHERE status = $1;
        `;
    const result = await this.dataSource.query(query, [
      GameStatus.PendingSecondPlayer,
    ]);

    if (!result.length) {
      return null;
    }
    return result[0].id;
  }

  async currentGameAnswerProgress(
    userId: string,
    gameId: string,
  ): Promise<number> {
    const query = `
            SELECT COUNT(*)
              FROM sql_user_answer
             WHERE "userId" = $1
               AND "gameId" = $2; 
        `;
    const result = await this.dataSource.query(query, [userId, gameId]);

    return result[0].count;
  }

  async findGamesWhichNeedComplete(currentTime: string): Promise<GameWhichNeedComplete[]> {
    const query = `
      SELECT g.id AS "gameId", ua."userId" AS "fistAnsweredPlayerId", MAX(ua."addedAt") AS "fistPlayerAnsweredTime",
             (SELECT COUNT(*)
                FROM sql_user_answer
               WHERE "gameId" = g.id
                 AND "userId" != ua."userId") AS "secondPlayerAnswerProgress"
        FROM sql_game g
        JOIN (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY "gameId", "userId" ORDER BY "addedAt") AS rn
          FROM sql_user_answer
        ) ua ON ua."gameId" = g.id
       WHERE ua."userId" IN (
             SELECT "userId"
             FROM sql_user_answer
             WHERE "gameId" = g.id
             GROUP BY "userId"
             HAVING COUNT(*) = $1
       )
       GROUP BY g.id, ua."userId"
      HAVING COUNT(*) = $1
         AND (to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS.MS""Z"') - MAX(CASE WHEN rn = 5 THEN to_timestamp(ua."addedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS""Z"') END) >= interval '10 seconds');
    `
    return await this.dataSource.query(query, [Number(settings.gameRules.questionsCount), currentTime])
  }

  private getGameQuery({
                         _gameIdFilter,
                         gameStatus,
                         dto,
                       }: gameQueryOptions): string {
    let gameIdFilter = '';
    if (_gameIdFilter) {
      gameIdFilter = `WHERE g.id = $2`;
    }

    let gameStatusFilter = '';
    if (Array.isArray(gameStatus)) {
      // if !gameStatus then return false
      gameStatusFilter = `WHERE g.status IN (${gameStatus
        .map((status) => `'${status}'`)
        .join(',')})`;
    }

    let gamesPaginationFilter = '';
    if (dto) {
      gamesPaginationFilter = `
        ORDER BY g."${dto.sortBy}" ${dto.sortDirection},
                 g."pairCreatedDate" DESC
        LIMIT ${dto.pageSize} OFFSET ${dto.skip};
      `;
    }

    return `
      SELECT g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
               COALESCE(fp."gameHost", 'false') AS "firstUserHost",
               fp.score AS "firstUserScore",
               sp.score AS "secondUserScore",
               (SELECT JSON_AGG(
                       JSON_BUILD_OBJECT(
                            'id', gq."questionId",
                            'body', q.body
                       )ORDER BY gq.id
               )
                  FROM sql_game_questions gq
                  JOIN sql_questions q ON q.id = gq."questionId"
                 WHERE gq."gameId" = g.id
                 GROUP BY gq."gameId"
               ) AS questions,
               JSON_BUILD_OBJECT('id', fp."userId", 'login', fu.login) AS "firstUser",
               JSON_BUILD_OBJECT('id', sp."userId", 'login', su.login) AS "secondUser",
               (SELECT JSON_AGG(
                       JSON_BUILD_OBJECT(
                            'answerStatus', ua."answerStatus",
                            'addedAt', ua."addedAt",
                            'questionId', gq."questionId"
                       )
               )
                  FROM sql_user_answer ua
                  JOIN sql_game_questions gq ON gq."questionId" = ua."questionId" AND gq."gameId" = ua."gameId"
                 WHERE gq."gameId" = g.id AND ua."userId" = fp."userId"
                 GROUP BY ua."userId"
               ) AS "firstUserAnswers",
               (SELECT JSON_AGG(
                       JSON_BUILD_OBJECT(
                            'answerStatus', ua."answerStatus",
                            'addedAt', ua."addedAt",
                            'questionId', gq."questionId"
                       )
               )
                  FROM sql_user_answer ua
                  JOIN sql_game_questions gq ON gq."questionId" = ua."questionId" AND gq."gameId" = ua."gameId"
                 WHERE gq."gameId" = g.id AND ua."userId" = sp."userId"
                 GROUP BY ua."userId"
               ) AS "secondUserAnswers"
              FROM sql_game g
              JOIN sql_game_progress fp ON g.id = fp."gameId" AND fp."userId" = $1
              LEFT JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != $1
              JOIN sql_users fu ON fp."userId" = fu.id
              LEFT JOIN sql_users su ON sp."userId" = su.id
             ${gameIdFilter} 
             ${gameStatusFilter}
             GROUP BY g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
                   COALESCE(fp."gameHost", 'false'),
                   fp.score, fp."userId", sp.score, sp."userId",
                   fu.login,
                   su.login
             ${gamesPaginationFilter};
    `;
  }

  private getSortBy(sortBy: string | string[]) {
    if (!sortBy) {
      return '';
    }

    let parametrs = [];
    if (typeof sortBy === 'string') {
      parametrs.push(sortBy);
    } else {
      parametrs = sortBy;
    }

    let result = 'ORDER BY ';
    for (const parametr of parametrs) {
      const [field, direction] = parametr.split(' ');
      result += `"${field}" ${direction},`;
    }

    return result.slice(0, -1);
  }
}
