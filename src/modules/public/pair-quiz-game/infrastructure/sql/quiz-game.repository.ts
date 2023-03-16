import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GameStatus } from '../../shared/game-status';
import { SqlGameProgress } from './entity/sql-game-progress.entity';
import { ViewGame } from '../../api/view/view-game';
import { SqlGame } from './entity/sql-game.entity';
import { SqlQuestions } from '../../../../sa/questions/infrastructure/sql/entity/questions.entity';
import { exists } from 'fs';
import { SqlUsers } from '../../../../sa/users/infrastructure/sql/entity/users.entity';
import { Questions } from '../../shared/questions';
import { ViewPlayer } from '../../api/view/view-player';

export class QuizGameRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkUserCurrentGame(userId: string): Promise<boolean> {
    const builder = this.dataSource
      .createQueryBuilder(SqlGameProgress, 'gp')
      .leftJoin('gp.sql_game', 'g', 'g.status = :status', {
        status: GameStatus.Active,
      })
      .where('gp.userId = :id', { id: userId });
    return await builder.getExists();
  }

  async checkOpenGame(): Promise<string | null> {
    const builder = this.dataSource
      .createQueryBuilder(SqlGame, 'g')
      .select('g.id', 'gameId')
      .where('g.status = :status', { status: GameStatus.PendingSecondPlayer });
    return await builder.getRawOne();
  }

  async createGame(userId: string): Promise<ViewGame> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      const questions = await this.getQuestions();
      const game = await manager
        .getRepository(SqlGame)
        .save(new SqlGame(questions));
      await manager
        .getRepository(SqlGameProgress)
        .save(new SqlGameProgress(game.id, userId));
      const userLogin = await manager
        .createQueryBuilder(SqlUsers, 'u')
        .select('u.login', 'login')
        .where('u.id = :id', { id: userId })
        .getRawOne();

      return new ViewGame(game, questions, new ViewPlayer(userId, userLogin));
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  //
  // async joinGame(userId: string): Promise<ViewGame> {
  //
  // }

  private async getQuestionsCount(): Promise<number> {
    const builder = this.dataSource
      .createQueryBuilder(SqlQuestions, 'q')
      .where(`EXISTS(SELECT * FROM sql_correct_answers)`);
    return await builder.getCount();
  }

  private async getQuestions(): Promise<Questions[]> {
    const builder = this.dataSource
      .createQueryBuilder(SqlQuestions, 'q')
      .select('q.id', 'id')
      .select('q.body', 'body')
      .where(`EXISTS(SELECT * FROM sql_correct_answers)`)
      .orderBy('RANDOM()')
      .limit(5);
    return await builder.getMany();
  }
}
