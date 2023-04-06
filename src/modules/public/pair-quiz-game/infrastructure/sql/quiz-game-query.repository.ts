import { IQuizGameQueryRepository } from '../i-quiz-game-query.repository';
import { GameStatus } from '../../shared/game-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ViewGame } from '../../api/view/view-game';
import { toViewGame } from '../../../../../common/data-mapper/to-view-game';
import { SimpleGameDb } from './pojo/simple-game.db';
import { PlayerIdDb } from './pojo/player-id.db';
import { GetCorrectAnswerDb } from './pojo/get-correct-answer.db';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { GameDb } from './pojo/game.db';
import { GameQueryDto } from '../../api/dto/query/game-query.dto';
import {ViewUserStatistic} from "../../api/view/view-user-statistic";
import {UserStatisticDb} from "./pojo/user-statistic.db";

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyGames(
    userId: string,
    queryDto: GameQueryDto,
  ): Promise<ViewPage<ViewGame>> {
    const query = `
        SELECT g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
               COALESCE(fp."gameHost", 'false') AS "firstUserHost",
               fp.score AS "firstPlayerScore",
               sp.score AS "secondPlayerScore",
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
              JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != $1
              JOIN sql_users fu ON fp."userId" = fu.id
              JOIN sql_users su ON sp."userId" = su.id
             GROUP BY g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
                   COALESCE(fp."gameHost", 'false'),
                   fp.score, fp."userId", sp.score, sp."userId",
                   fu.login,
                   su.login
             ORDER BY g."${queryDto.sortBy}" ${queryDto.sortDirection},
                      g."pairCreatedDate" DESC
             LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};
    `;
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

  async getMyCurrentGame(gameId: string): Promise<ViewGame> {
    const query = this.getQuery(true);

    const result: SimpleGameDb[] = await this.dataSource.query(query, [gameId]);
    if (!result.length) {
      return null;
    }

    return toViewGame(result);
  }

  async getGameById(gameId: string): Promise<ViewGame | null> {
    const query = this.getQuery();

    const result: SimpleGameDb[] = await this.dataSource.query(query, [gameId]);
    if (!result.length) {
      return null;
    }

    return toViewGame(result);
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
    const query = `
      SELECT COUNT(g.id) AS "gamesCount",
             SUM(fp.score) AS "sumScore",
             SUM(CASE WHEN fp.score - sp.score > 0 THEN 1 ELSE 0 END) AS "winsCount",
             SUM(CASE WHEN fp.score - sp.score < 0 THEN 1 ELSE 0 END) AS "lossesCount",
             SUM(CASE WHEN fp.score - sp.score = 0 THEN 1 ELSE 0 END) AS "drawsCount"
        FROM sql_game g
        JOIN sql_game_progress fp ON g.id = fp."gameId" AND fp."userId" = $1
        JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != $1;
    `;
    const result: UserStatisticDb = await this.dataSource.query(query, [userId])

    return new ViewUserStatistic(result[0])
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

  private getQuery(myGame?: boolean): string {
    let filter = '';
    if (myGame) {
      filter = `AND g.status != '${GameStatus.Finished}'`;
    }

    return `
      SELECT g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
             gp."userId", gp.score, gq."questionId",
             ua."answerStatus", ua."addedAt",
             u.login,
             q.body
        FROM sql_game g
        LEFT JOIN sql_game_progress gp ON gp."gameId" = g.id
        LEFT JOIN sql_game_questions gq ON gq."gameId" = g.id
        LEFT JOIN sql_user_answer ua ON ua."userId" = gp."userId" 
         AND ua."questionId" = gq."questionId" 
         AND ua."gameId" = g.id
        LEFT JOIN sql_users u ON u.id = gp."userId"
        LEFT JOIN sql_questions q ON q.id = gq."questionId"
       WHERE g.id = $1 ${filter}
       ORDER BY gp."gameHost" DESC, gq.id ASC;
    `;
  }
}
