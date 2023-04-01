import { IQuizGameQueryRepository } from '../i-quiz-game-query.repository';
import { GameStatus } from '../../shared/game-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ViewGame } from '../../api/view/view-game';
import { toViewGame } from '../../../../../common/data-mapper/to-view-game';
import { GameDb } from './pojo/game.db';
import { PlayerIdDb } from './pojo/player-id.db';
import { GetCorrectAnswerDb } from './pojo/get-correct-answer.db';

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyCurrentGame(gameId: string): Promise<ViewGame> {
    const query = this.getQuery(true);
    console.log(query)
    console.log(gameId)
    const result: GameDb[] = await this.dataSource.query(query, [gameId]);
    console.log(result)
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
       ORDER BY gp."gameHost" DESC, ua.id ASC;
    `
  }
}
