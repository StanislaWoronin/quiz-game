import { IQuizGameQueryRepository } from '../i-quiz-game-query.repository';
import { GameStatus } from '../../shared/game-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ViewGame } from '../../api/view/view-game';
import { toViewGame } from '../../../../../common/data-mapper/to-view-game';
import { GameDb } from './pojo/game.db';
import { PlayerIdDb } from './pojo/player-id.db';
import { GetCorrectAnswerDb } from './pojo/get-correct-answer.db';
import {ViewPage} from "../../../../../common/pagination/view-page";

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyGames(userId): Promise<ViewPage<ViewGame>> {
    const query = `
        SELECT g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
               COALESCE(gp1."gameHost", 'false') AS "firstUserHost",
               fp.score AS "firstPlayerScore",
               sp.score AS "secondPlayerScore",
               JSON_BUILD_OBJECT('id', fp."userId", 'login', fu.login) AS "firstUser",
               JSON_BUILD_OBJECT('id', sp."userId", 'login', su.login) AS "secondUser",
               JSON_BUILD_OBJECT('id', gq."questionId", 'body', q.body) AS questions,
               JSON_BUILD_OBJECT('answerStatus', ua."answerStatus", 'addedAt', ua."addedAt", 'questionId', gq."questionId") AS answer
          FROM sql_game g
          JOIN sql_game_progress fp ON g.id = fp."gameId" AND fp."userId" = 'c9b93818-e50a-42c0-ba27-6af2c6e13c49'
          JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != 'c9b93818-e50a-42c0-ba27-6af2c6e13c49'
          JOIN sql_game_questions gq ON gq."gameId" = g.id
          LEFT JOIN sql_questions q ON q.id = gq."questionId"
          JOIN sql_users fu ON fp."userId" = fu.id
          JOIN sql_users su ON sp."userId" = su.id
          LEFT JOIN sql_game_progress gp1 ON fp."userId" = gp1."userId" AND g.id = gp1."gameId"
          JOIN sql_user_answer ua ON ua."questionId" = gq."questionId" AND ua."gameId" = g.id
    `;
    const result = await this.dataSource.query(query)

    return result
  }

  async getMyCurrentGame(gameId: string): Promise<ViewGame> {
    const query = this.getQuery(true);

    const result: GameDb[] = await this.dataSource.query(query, [gameId]);
    if (!result.length) {
      return null;
    }

    return toViewGame(result);
  }

  async getGameById(gameId: string): Promise<ViewGame | null> {
    const query = this.getQuery();

    const result: GameDb[] = await this.dataSource.query(query, [gameId]);
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
    `
  }
}

// SELECT
// g.id,
//     g.status,
//     g."pairCreatedDate",
//     g."startGameDate",
//     g."finishGameDate",
//     COALESCE(gp1."gameHost", 'false') AS "firstUserHost",
//     fp.score AS "firstPlayerScore",
//     sp.score AS "secondPlayerScore",
//     JSON_BUILD_OBJECT('id', fp."userId", 'login', fu.login) AS "firstUser",
//     JSON_BUILD_OBJECT('id', sp."userId", 'login', su.login) AS "secondUser",
//     JSON_AGG(
//         CASE
// WHEN ua."userId" = fp."userId" THEN
// JSON_BUILD_OBJECT(
//     'answerStatus', ua."answerStatus",
//     'addedAt', ua."addedAt",
//     'questionId', gq."questionId"
// )
// ELSE
// NULL
// END
// ) AS firstUserAnswers,
//     JSON_AGG(
//         CASE
// WHEN ua."userId" = sp."userId" THEN
// JSON_BUILD_OBJECT(
//     'answerStatus', ua."answerStatus",
//     'addedAt', ua."addedAt",
//     'questionId', gq."questionId"
// )
// ELSE
// NULL
// END
// ) AS secondUserAnswers
// FROM
// sql_game g
// JOIN sql_game_progress fp ON g.id = fp."gameId" AND fp."userId" = 'c9b93818-e50a-42c0-ba27-6af2c6e13c49'
// JOIN sql_game_progress sp ON g.id = sp."gameId" AND sp."userId" != 'c9b93818-e50a-42c0-ba27-6af2c6e13c49'
// JOIN sql_game_questions gq ON gq."gameId" = g.id
// LEFT JOIN sql_questions q ON q.id = gq."questionId"
// JOIN sql_users fu ON fp."userId" = fu.id
// JOIN sql_users su ON sp."userId" = su.id
// LEFT JOIN sql_game_progress gp1 ON fp."userId" = gp1."userId" AND g.id = gp1."gameId"
// JOIN sql_user_answer ua ON ua."questionId" = gq."questionId" AND ua."gameId" = g.id
// GROUP BY
// g.id,
//     g.status,
//     g."pairCreatedDate",
//     g."startGameDate",
//     g."finishGameDate",
//     COALESCE(gp1."gameHost", 'false'),
// fp.score,
//     sp.score,
//     fp."userId",
//     fu.login,
//     sp."userId",
//     su.login;
