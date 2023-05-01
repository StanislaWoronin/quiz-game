import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GameStatus } from '../../shared/game-status';
import { SqlGameProgress } from './entity/sql-game-progress.entity';
import { ViewGame } from '../../api/view/view-game';
import { SqlGame } from './entity/sql-game.entity';
import { SqlUsers } from '../../../../sa/users/infrastructure/sql/entity/users.entity';
import { IQuizGameRepository } from '../i-quiz-game.repository';
import { ViewAnswer } from '../../api/view/view-answer';
import { AnswerStatus } from '../../shared/answer-status';
import { SqlUserAnswer } from './entity/sql-user-answer.entity';
import { ViewGameProgress } from '../../api/view/view-game-progress';
import { SqlGameQuestions } from './entity/sql-game-questions.entity';
import { SimpleGameDb } from './pojo/simple-game.db';
import { toViewJoinGame } from '../../../../../common/data-mapper/to-view-join-game';
import { SendAnswerDto } from '../../applications/dto/send-answer.dto';
import { GameProgressDb } from './pojo/game-progress.db';
import { GameWhichNeedComplete } from './pojo/game-which-need-complete';
import { settings } from '../../../../../settings';
import { DelayedForceGameOverEvent } from '../../applications/dto/delayed-force-game-over.event';
import { GameInfoForTimeoutForceGameOver } from './pojo/game-info-for-timeout-forsce-game-over';
import { Injectable } from '@nestjs/common';

@Injectable()
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

      const startedGame: SimpleGameDb[] = await manager.query(
        this.getStartedGame(),
        [gameId],
      );

      await queryRunner.commitTransaction();
      return toViewJoinGame(startedGame);
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

  async forceGameOverSchedule() {
    const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const currentTime = new Date().toISOString();
      const games: GameWhichNeedComplete[] = await this.dataSource.query(
        this.findGameWhichNeedComplete(),
        [Number(settings.gameRules.questionsCount), currentTime],
      );
      if (!games.length) return;
      const setAnswersPromises = [];
      const updateGameStatusPromises = [];
      const setExtraScorePromises = [];
      for (const game of games) {
        const unansweredQuestions = game.questions.slice(
          game.secondPlayerAnswerProgress,
        );
        const answers = unansweredQuestions.map(
          (q) =>
            new SqlUserAnswer(
              game.secondAnsweredPlayerId,
              game.gameId,
              q,
              null,
            ),
        );
        setAnswersPromises.push(manager.save(answers));

        updateGameStatusPromises.push(
          manager
            .createQueryBuilder()
            .update(SqlGame)
            .set({
              status: GameStatus.Finished,
              finishGameDate: new Date().toISOString(),
            })
            .where('id = :gameId', { gameId: game.gameId })
            .execute(),
        );

        const extraPoint = 1;
        if (game.firstAnsweredPlayerScore !== 0) {
          const newScore = game.firstAnsweredPlayerScore + extraPoint;
          setExtraScorePromises.push(
            await manager
              .createQueryBuilder()
              .update(SqlGameProgress)
              .set({ score: newScore })
              .where('userId = :userId AND gameId = :gameId', {
                userId: game.firstAnsweredPlayerId,
                gameId: game.gameId,
              })
              .execute(),
          );
        }
      }
      await Promise.all(setAnswersPromises);
      await Promise.all(updateGameStatusPromises);
      await Promise.all(setExtraScorePromises);
      //await queryRunner.commitTransaction();
      return;
    } catch (e) {
      return null;
      //await queryRunner.rollbackTransaction();
    } //finally {
    //   await queryRunner.release();
    // }
  }

  async forceGameOverTimeOut(event: DelayedForceGameOverEvent) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const [gameInfo]: GameInfoForTimeoutForceGameOver[] = await manager.query(
        this.getQueryForTimeOutForceGameOver(),
        [event.gameId, event.userId, GameStatus.Active],
      );

      if (gameInfo) {
        const unansweredQuestions = gameInfo.questions.slice(
          gameInfo.countAnsweredQuestions,
        );
        const answers = unansweredQuestions.map(
          (questionId) =>
            new SqlUserAnswer(
              gameInfo.playerIdWithoutAnswers,
              event.gameId,
              questionId,
              null,
            ),
        );
        await manager.save(answers);

        await manager
          .createQueryBuilder()
          .update(SqlGame)
          .set({
            status: GameStatus.Finished,
            finishGameDate: new Date().toISOString(),
          })
          .where('id = :gameId', { gameId: event.gameId })
          .execute();

        const extraScore = 1;
        if (gameInfo.scoreFistAnsweredPlayer !== 0) {
          await manager
            .createQueryBuilder()
            .update(SqlGameProgress)
            .set({ score: () => `score + ${extraScore}` })
            .where('userId = :userId AND gameId = :gameId', {
              userId: event.userId,
              gameId: event.gameId,
            })
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      return;
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // *****************************************************************************

  private async getQuestions(): Promise<{ id: string }[]> {
    const query = `
      SELECT id FROM sql_questions
       ORDER BY RANDOM()
       LIMIT 5
    `;
    return await this.dataSource.query(query);
  }

  private getStartedGame(): string {
    return `
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

  private findGameWhichNeedComplete = (): string => {
    return `
      SELECT g.id AS "gameId", 
             fua."userId" AS "firstAnsweredPlayerId",
             sgp."userId" AS "secondAnsweredPlayerId",
             (SELECT COUNT(*)
                FROM sql_user_answer 
               WHERE "gameId" = g.id AND "userId" = sgp."userId") AS "secondPlayerAnswerProgress",
             (SELECT score FROM sql_game_progress WHERE "gameId" = g.id AND "userId" = fua."userId") AS "firstAnsweredPlayerScore",  
             (SELECT JSON_AGG("questionId")
                FROM sql_game_questions gq
               WHERE "gameId" = g.id) AS questions  
        FROM sql_game g
        JOIN sql_user_answer fua ON fua."gameId" = g.id
        JOIN sql_game_progress sgp ON sgp."gameId" = g.id AND sgp."userId" != fua."userId"
       WHERE g.status = 'Active'
       GROUP BY g.id, fua."userId", sgp."userId"
      HAVING COUNT(*) = $1
             AND (to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS.MS""Z"') - to_timestamp(MAX(fua."addedAt"), 'YYYY-MM-DD"T"HH24:MI:SS.MS""Z"') >= interval '8 seconds');
    `;
  };

  private getQueryForTimeOutForceGameOver = (): string => {
    return `
      SELECT g.status AS "gameStatus", 
             (SELECT COUNT(*)
                FROM sql_user_answer
               WHERE "userId" != $2
                 AND "gameId" = g.id) AS "countAnsweredQuestions",
             (SELECT "userId" 
                FROM sql_game_progress 
               WHERE "userId" != $2
                 AND "gameId" = g.id) AS "playerIdWithoutAnswers",
             (SELECT score 
                FROM sql_game_progress gp 
               WHERE gp."gameId" = g.id
                 AND gp."userId" = $2) AS "scoreFistAnsweredPlayer",
             (SELECT JSON_AGG(gq."questionId")
                FROM sql_game_questions gq
               WHERE gq."gameId" = g.id) AS questions
        FROM sql_game g
       WHERE g.id = $1 
         AND g.status = $3;
    `;
  };
}
