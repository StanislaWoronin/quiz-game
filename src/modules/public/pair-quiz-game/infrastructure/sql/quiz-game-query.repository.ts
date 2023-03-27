import {IQuizGameQueryRepository} from "../i-quiz-game-query.repository";
import {SqlGameProgress} from "./entity/sql-game-progress.entity";
import {GameStatus} from "../../shared/game-status";
import {SqlGame} from "./entity/sql-game.entity";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import { CheckGameProgressDb } from "./pojo/checkGameProgressDb";
import {ViewGame} from "../../api/view/view-game";
import {toViewJoinGame} from "../../../../../common/data-mapper/to-view-join-game";
import {toViewGame} from "../../../../../common/data-mapper/to-view-game";
import {GameDb} from "./pojo/game.db";

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getMyCurrentGame(userId): Promise<ViewGame> {
        const query = `
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
                ON gp."gameId" = $1
              LEFT JOIN sql_game_questions gq  
                ON gq."gameId" = $1
              LEFT JOIN sql_user_answer ua
                ON ua."gameId" = $1
               AND ua."questionId" = gq."questionId"
             WHERE g.id = $1;
        `
        console.log(userId)
        const result: GameDb[] = await this.dataSource.query(query, [userId])
        console.log(result)
        if (!result.length) {
            return null
        }
        return toViewGame(result)
    }

    async getGameById(gameId): Promise<ViewGame | null> {
        const query = `
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
                ON gp."gameId" = $1
              LEFT JOIN sql_game_questions gq  
                ON gq."gameId" = $1
              LEFT JOIN sql_user_answer ua
                ON ua."gameId" = $1
               AND ua."questionId" = gq."questionId"
             WHERE g.id = $1;
        `
        const result: GameDb[] = await this.dataSource.query(query, [gameId])
        if (!result.length) {
            return null
        }
        return toViewGame(result)
    }

    async checkUserCurrentGame(userId: string): Promise<boolean> {
        const query = `
            SELECT(EXISTS(SELECT * FROM sql_game g
                            LEFT JOIN sql_game_progress gp
                              ON gp."gameId" = g.id
                           WHERE gp."userId" = $1
                             AND g.status = $2)) as exists;
        `
        const result = await this.dataSource.query(query, [userId, GameStatus.Active])

        return result[0].exists
    }

    async checkOpenGame(): Promise<string | null> {
        const query = ` 
            SELECT id FROM sql_game WHERE status = $1
        `
        const result = await this.dataSource.query(query, [GameStatus.PendingSecondPlayer])

        if (!result.length) {
            return null
        }
        return result[0].id
    }

    async checkUserGameProgress(userId: string): Promise<CheckGameProgressDb> {
        const query = `
            SELECT gp."gameId", ua."userAnswer",
                   q.id AS "questionId", q."correctAnswers" 
              FROM sql_game_progress gp
              LEFT JOIN sql_user_answer ua
                ON ua."gameId" = gp."gameId" 
               AND ua."userId" = $1
              LEFT JOIN sql_game_questions gq
                ON gq."gameId" = gp."gameId" 
              LEFT JOIN sql_questions q
                ON q.id = gq."questionId"
              WHERE gp."userId" = $1
                AND ua."userAnswer" isNull
              LIMIT 1;
        `
        const result = await this.dataSource.query(query, [userId])

        return result[0]
    }
}