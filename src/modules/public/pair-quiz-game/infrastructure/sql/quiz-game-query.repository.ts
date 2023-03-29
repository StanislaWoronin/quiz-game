import {IQuizGameQueryRepository} from "../i-quiz-game-query.repository";
import {GameStatus} from "../../shared/game-status";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {CheckAnswerProgressDb} from "./pojo/checkAnswerProgressDb";
import {ViewGame} from "../../api/view/view-game";
import {toViewGame} from "../../../../../common/data-mapper/to-view-game";
import {GameDb} from "./pojo/game.db";
import {PlayerIdDb} from "./pojo/player-id.db";
import {GetCorrectAnswerDb} from "./pojo/get-correct-answer.db";

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getMyCurrentGame(userId): Promise<ViewGame> {
        const query = this.getQuery(GameStatus.Active) // TODO fix
        const result: GameDb[] = await this.dataSource.query(query, [userId])
        if (!result.length) {
            return null
        }

        return toViewGame(result)
    }

    async getGameById(gameId: string): Promise<ViewGame | null> {
        const query = this.getQuery()
        const result: GameDb[] = await this.dataSource.query(query, [gameId])
        if (!result.length) {
            return null
        }

        return toViewGame(result)
    }

    async getPlayerByGameId(gameId: string): Promise<PlayerIdDb[]> {
        const query = `
            SELECT "userId" AS "playerId"
              FROM sql_game_progress
             WHERE "gameId" = $1;
        `
        return await this.dataSource.query(query, [gameId])
    }

    async getCorrectAnswers(userId: string, lastQuestionNumber: number): Promise<GetCorrectAnswerDb> {
        const query = `
            SELECT gq."gameId", gq."questionId", q."correctAnswers"
              FROM sql_game_progress gp
              LEFT JOIN sql_game_questions gq
                ON gq."gameId" = gp."gameId"
              LEFT JOIN sql_questions q
                ON q.id = gq."questionId"
             WHERE gp."userId" = $1
            OFFSET $2 LIMIT 1;
        `
        const result = await this.dataSource.query(query, [userId, lastQuestionNumber])

        return result[0]
    }

    async checkUserCurrentGame(userId: string): Promise<string | null> {
        const query = `
            SELECT g.id AS "gameId"
              FROM sql_game g
              LEFT JOIN sql_game_progress gp
                ON gp."gameId" = g.id
             WHERE gp."userId" = $1
               AND g.status = $2;
        `
        const result = await this.dataSource.query(query, [userId, GameStatus.Active])
        if(!result.length) {
            return null
        }

        return result[0].gameId
    }

    async checkOpenGame(): Promise<string | null> {
        const query = ` 
            SELECT id FROM sql_game WHERE status = $1;
        `
        const result = await this.dataSource.query(query, [GameStatus.PendingSecondPlayer])

        if (!result.length) {
            return null
        }
        return result[0].id
    }

    async checkUserAnswerProgress(userId: string): Promise<CheckAnswerProgressDb[]> {
        const query = `
            SELECT ua."userAnswer"
              FROM sql_user_answer ua
              LEFT JOIN sql_game_progress gp
                ON gp."userId" = ua."userId"
              LEFT JOIN sql_game g
                ON g.id = gp."gameId"
             WHERE ua."userId" = $1
               AND g.status = $2; 
        `
        return await this.dataSource.query(query, [userId, GameStatus.Active])
    }

    private getQuery(gameStatus?: GameStatus): string {
        let filter = ''
        if (gameStatus) {
            filter = `AND g.status = '${gameStatus}'` // TODO fix
        }
        return `
            SELECT g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
                       gp."userId", gp.score,
                       gq."questionId",
                       ua."answerStatus", ua."addedAt",  
                       (SELECT u.login 
                          FROM sql_users u
                         WHERE u.id = gp."userId"),
                       (SELECT q.body
                          FROM sql_questions q
                         WHERE q.id = gq."questionId")
                  FROM sql_game g
                  LEFT JOIN sql_game_progress gp
                    ON gp."gameId" = g.id
                  LEFT JOIN sql_game_questions gq  
                    ON gq."gameId" = g.id
                  LEFT JOIN sql_user_answer ua
                    ON ua."userId" = gp."userId"
                   AND ua."questionId" = gq."questionId"
                 WHERE g.id = $1
                   ${filter}
                 ORDER BY login, "addedAt" ASC;
        `
    }
}