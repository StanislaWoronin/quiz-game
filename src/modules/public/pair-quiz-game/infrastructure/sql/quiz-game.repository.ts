import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {GameStatus} from '../../shared/game-status';
import {SqlGameProgress} from './entity/sql-game-progress.entity';
import {ViewGame} from '../../api/view/view-game';
import {SqlGame} from './entity/sql-game.entity';
import {SqlUsers} from '../../../../sa/users/infrastructure/sql/entity/users.entity';
import {IQuizGameRepository} from "../i-quiz-game.repository";
import {ViewAnswer} from "../../api/view/view-answer";
import {AnswerStatus} from "../../shared/answer-status";
import {SqlUserAnswer} from "./entity/sql-user-answer.entity";
import { ViewGameProgress } from "../../api/view/view-game-progress";
import { SqlGameQuestions } from "./entity/sql-game-questions.entity";
import { JoinGameDb } from "./pojo/join-game.db";
import { toViewJoinGame } from "../../../../../common/data-mapper/to-view-join-game";
import { SendAnswerDto } from "../../applications/dto/send-answer.dto";

export class QuizGameRepository implements IQuizGameRepository{
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createGame(userId: string): Promise<ViewGame> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      const game = await manager
        .getRepository(SqlGame)
        .save(new SqlGame());

      await manager
        .getRepository(SqlGameProgress)
        .save(new SqlGameProgress(game.id, userId));

      const questions = await this.getQuestions();
      const mappedQuestions = questions.map(q => new SqlGameQuestions(game.id, q.id))
      await manager
        .getRepository(SqlGameQuestions)
        .save(mappedQuestions)

      const userLogin = await manager
        .createQueryBuilder(SqlUsers, 'u')
        .select('u.login', 'login')
        .where('u.id = :id', { id: userId })
        .getRawOne();

      await queryRunner.commitTransaction()
      return new ViewGame(game, new ViewGameProgress(userId, userLogin.login));
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async joinGame(userId: string, gameId: string): Promise<ViewGame> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      const gameProgress = new SqlGameProgress(gameId, userId);
      await manager.getRepository(SqlGameProgress).save(gameProgress);

      await manager
          .createQueryBuilder()
          .update(SqlGame)
          .set({
            status: GameStatus.Active,
            startGameDate: new Date().toISOString()
          })
          .where('id = :gameId', { gameId })
          .execute()

      const gameBuilder = `
        SELECT g.id, g.status, g."pairCreatedDate", g."startGameDate", g."finishGameDate",
               gp."userId", 
               gq."questionId",
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
         WHERE g.id = $1;  
      `
      const game: JoinGameDb[] = await manager.query(gameBuilder, [gameId])
      await queryRunner.commitTransaction()
      return toViewJoinGame(game)
    } catch (e) {
      console.log(e)
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      const createdAnswer = await manager
          .save(new SqlUserAnswer(
              dto.userId,
              dto.gameId,
              dto.questionsId,
              dto.answer,
              dto.answerStatus,
          ))

      let score = 0
      if (dto.answerStatus === AnswerStatus.Correct) {
        score = 1
      }
      await manager.createQueryBuilder()
          .update(SqlGameProgress)
          .set({score: () => `score + ${score}`})
          .where('userId = :userId', {userId: dto.userId})
          .andWhere('questionsId = :questionsId', {questionsId: dto.questionsId})

      await queryRunner.commitTransaction()
      return new ViewAnswer(dto.questionsId, dto.answerStatus, createdAnswer.addedAt)
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async getQuestions(): Promise<{ id: string }[]> {
    const query = `
      SELECT id FROM sql_questions
       ORDER BY RANDOM()
       LIMIT 5
    `
    return await this.dataSource.query(query)
    // const builder = this.dataSource
    //   .createQueryBuilder(SqlQuestions, 'q')
    //   .select('q.id', 'id')
    //   .where(`EXISTS(SELECT * FROM sql_correct_answers)`)
    //   .orderBy('RANDOM()')
    //   .limit(5);
    // const result = await builder.getRawMany();
    // return result.map(r => r.id)
  }
}
