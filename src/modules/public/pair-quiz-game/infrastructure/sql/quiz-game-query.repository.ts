import {IQuizGameQueryRepository} from "../i-quiz-game-query.repository";
import {SqlGameProgress} from "./entity/sql-game-progress.entity";
import {GameStatus} from "../../shared/game-status";
import {SqlGame} from "./entity/sql-game.entity";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {ViewGame} from "../../api/view/view-game";
import {UserGameProgress} from "./pojo/user-game-progress";
import {util} from "prettier";
import skipEverythingButNewLine = util.skipEverythingButNewLine;

export class QuizGameQueryRepository implements IQuizGameQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    // async getMyCurrentGame(userId): Promise<ViewGame> {
    //
    // }
    //
    // async getGameById(gameId): Promise<ViewGame> {
    //
    // }

    async checkUserCurrentGame(userId: string): Promise<boolean> {
        const query = `
            SELECT(EXISTS(SELECT * FROM sql_game g
                            LEFT JOIN sql_game_progress gp
                              ON gp."gameId" = g.id
                           WHERE gp."userId" = $1
                             AND g.status = $2)) as exists
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

    async checkUserGameProgress(userId: string): Promise<UserGameProgress> {
        const builder = this.dataSource
            .createQueryBuilder(SqlGameProgress, 'gp')
            .select('gp."gameId"', 'gameId')
            .addSelect('gp.answers', 'answers')
            .addSelect('g.questions', 'questions')
            .leftJoin(SqlGame, 'g')
            .where('gp.userId = :id', {id: userId})
        console.log('from checkUserGameProgress:', await builder.getRawOne())
        return await builder.getRawOne()
    }
}