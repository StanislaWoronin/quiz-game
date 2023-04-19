import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {GameStatus} from '../../shared/game-status';
import {SqlGameProgress} from './entity/sql-game-progress.entity';
import {ViewGame} from '../../api/view/view-game';
import {SqlGame} from './entity/sql-game.entity';
import {SqlUsers} from '../../../../sa/users/infrastructure/sql/entity/users.entity';
import {IQuizGameRepository} from '../i-quiz-game.repository';
import {ViewAnswer} from '../../api/view/view-answer';
import {AnswerStatus} from '../../shared/answer-status';
import {SqlUserAnswer} from './entity/sql-user-answer.entity';
import {ViewGameProgress} from '../../api/view/view-game-progress';
import {SqlGameQuestions} from './entity/sql-game-questions.entity';
import {SimpleGameDb} from './pojo/simple-game.db';
import {toViewJoinGame} from '../../../../../common/data-mapper/to-view-join-game';
import {SendAnswerDto} from '../../applications/dto/send-answer.dto';
import {GameProgressDb} from './pojo/game-progress.db';
import {DelayedForceGameOverEvent} from "../../applications/dto/delayed-force-game-over.event";

export class QuizGameRepository implements IQuizGameRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createGame(userId: string): Promise<ViewGame> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const newGame = new SqlGame();
      const game = await manager.save(newGame);

      await manager
        .getRepository(SqlGameProgress)
        .save(new SqlGameProgress(game.id, userId, true));

      const questions = await this.getQuestions();
      const mappedQuestions = questions.map(
        (q) => new SqlGameQuestions(game.id, q.id),
      );
      await manager.getRepository(SqlGameQuestions).save(mappedQuestions);

      const userLogin = await manager
        .createQueryBuilder(SqlUsers, 'u')
        .select('u.login', 'login')
        .where('u.id = :id', { id: userId })
        .getRawOne();

      await queryRunner.commitTransaction();
      return new ViewGame(game, new ViewGameProgress(userId, userLogin.login));
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async joinGame(userId: string, gameId: string): Promise<ViewGame> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const gameProgress = new SqlGameProgress(gameId, userId);
      await manager.getRepository(SqlGameProgress).save(gameProgress);

      await manager
        .createQueryBuilder()
        .update(SqlGame)
        .set({
          status: GameStatus.Active,
          startGameDate: new Date().toISOString(),
        })
        .where('id = :gameId', { gameId })
        .execute();

      const gameQuery = `
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
      `;
      const game: SimpleGameDb[] = await manager.query(gameQuery, [gameId]);

      await queryRunner.commitTransaction();
      return toViewJoinGame(game);
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const answer = new SqlUserAnswer(
        dto.userId,
        dto.gameId,
        dto.questionsId,
        dto.answer,
        dto.answerStatus,
      );
      const createdAnswer = await manager.save(answer);

      const score = dto.answerStatus === AnswerStatus.Correct ? 1 : 0;

      if (score !== 0) {
        await manager
          .createQueryBuilder()
          .update(SqlGameProgress)
          .set({ score: () => `score + ${score}` })
          .where('userId = :userId AND gameId = :gameId', {
            userId: dto.userId,
            gameId: dto.gameId,
          })
          .execute();
      }

      if (dto.isLastQuestions) {
        // if one item returned, then the current player was the first to answer on all questions
        const lastQuestionProgress: GameProgressDb[] = await manager.query(
          this.getLastQuestionsProgressQuery(),
          [dto.gameId, dto.questionsId],
        );

        if (lastQuestionProgress.length === 2) {
          const firstAnsweredPlayer = lastQuestionProgress[0];
          const extraScore = 1;

          await manager
            .createQueryBuilder()
            .update(SqlGame)
            .set({
              status: GameStatus.Finished,
              finishGameDate: new Date().toISOString(),
            })
            .where('id = :gameId', { gameId: dto.gameId })
            .execute();

          if (firstAnsweredPlayer.score !== 0) {
            await manager
              .createQueryBuilder()
              .update(SqlGameProgress)
              .set({ score: () => `score + ${extraScore}` })
              .where('userId = :userId AND gameId = :gameId', {
                userId: firstAnsweredPlayer.userId,
                gameId: dto.gameId,
              })
              .execute();
          }
        }

        if (lastQuestionProgress.length === 1) {
        }
      }

      await queryRunner.commitTransaction();
      return new ViewAnswer(
        dto.questionsId,
        dto.answerStatus,
        createdAnswer.addedAt,
      );
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // async forceGameOver() {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //
  //   try {
  //     const manager = queryRunner.manager;
  //
  //     const currentTime = new Date().toISOString();
  //     const games: GameWhichNeedComplete[] = await this.dataSource.query(
  //       this.findGameWhichNeedComplete(),
  //       [Number(settings.gameRules.questionsCount), currentTime],
  //     );
  //
  //     if (!games.length) return;
  //     for (const game of games) {
  //       const nextQuestionNumber = game.secondPlayerAnswerProgress;
  //       const unansweredQuestions: { questionId: string; userId: string }[] =
  //         await this.dataSource.query(this.getLastQuestionsIdQuery(), [
  //           game.fistAnsweredPlayerId,
  //           game.gameId,
  //           nextQuestionNumber,
  //         ]);
  //
  //       const lastQuestionsId =
  //         unansweredQuestions[unansweredQuestions.length - 1].questionId;
  //       const lastQuestionProgress: GameProgressDb[] = await manager.query(
  //         this.getLastQuestionsProgressQuery(),
  //         [game.gameId, lastQuestionsId],
  //       );
  //       const firstAnsweredPlayer = lastQuestionProgress[0];
  //
  //       const answers = unansweredQuestions.map(
  //         (q) => new SqlUserAnswer(q.userId, game.gameId, q.questionId, null),
  //       );
  //
  //       await manager.save(answers);
  //
  //       await manager
  //         .createQueryBuilder()
  //         .update(SqlGame)
  //         .set({
  //           status: GameStatus.Finished,
  //           finishGameDate: new Date().toISOString(),
  //         })
  //         .where('id = :gameId', { gameId: game.gameId })
  //         .execute();
  //
  //       const extraScore = 1;
  //       if (firstAnsweredPlayer.score !== 0) {
  //         await manager
  //           .createQueryBuilder()
  //           .update(SqlGameProgress)
  //           .set({ score: () => `score + ${extraScore}` })
  //           .where('userId = :userId AND gameId = :gameId', {
  //             userId: firstAnsweredPlayer.userId,
  //             gameId: game.gameId,
  //           })
  //           .execute();
  //       }
  //     }
  //
  //     await queryRunner.commitTransaction();
  //     return;
  //   } catch (e) {
  //     console.log(e);
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async forceGameOver(event: DelayedForceGameOverEvent) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const query = `
        SELECT g.status, ua."questionId",
               (SELECT JSON_AGG(gq."questionId")
                  FROM sql_game_questions gq
                 WHERE gq."gameId" = g.id) AS questions
          FROM sql_game g
          JOIN sql_user_answer ua ON ua."gameId" = g.id
         WHERE g.id = $1 
           AND g.status = 'Active'
           AND ua."userId" != $2
         ORDER BY ua."addedAt" DESC
         LIMIT 1;
      `
      console.log(event)
      const game = await manager.query(query, [event.gameId, event.userId])

      if (game[0].status === GameStatus.Active) {
        const lastAnsweredQuestionNumber = game[0].questions.indexOf(game[0].questionId)
        console.log({lastAnsweredQuestionNumber})
      }

      await queryRunner.commitTransaction();
      return;
    } catch (e) {
      console.log(e)
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
    `;
    return await this.dataSource.query(query);
  }

  private getLastQuestionsProgressQuery(): string {
    return `
        SELECT gp.score, gp."userId"
          FROM sql_game_progress gp
          JOIN sql_user_answer ua 
            ON ua."questionId" = $2
           AND ua."gameId" = $1
           AND ua."userId" = gp."userId"
         WHERE gp."gameId" = $1
         ORDER BY ua."addedAt" ASC
    `;
  }

  private getLastQuestionsIdQuery(): string {
    return `
        SELECT gq."questionId", gp."userId"
          FROM sql_game_questions gq
          JOIN sql_game_progress gp ON gp."gameId" = gq."gameId" 
           AND gp."userId" != $1
         WHERE gq."gameId" = $2 
        OFFSET $3;
    `;
  }

  private findGameWhichNeedComplete = (): string => {
    return `
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
    `;
  };
}
