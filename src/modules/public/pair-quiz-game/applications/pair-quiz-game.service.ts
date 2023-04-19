import { Inject, Injectable } from '@nestjs/common';
import { ViewGame } from '../api/view/view-game';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { AnswerDto } from '../api/dto/answer.dto';
import { ViewAnswer } from '../api/view/view-answer';
import { IQuizGameQueryRepository } from '../infrastructure/i-quiz-game-query.repository';
import { IQuestionsQueryRepository } from '../../../sa/questions/infrastructure/i-questions-query.repository';
import { SendAnswerDto } from './dto/send-answer.dto';
import { settings } from '../../../../settings';
import { EventBus } from '@nestjs/cqrs';
import { DelayedForceGameOverEvent } from './dto/delayed-force-game-over.event';

@Injectable()
export class PairQuizGameService {
  constructor(
    protected eventBus: EventBus,
    @Inject(IQuizGameRepository)
    protected gameRepository: IQuizGameRepository,
    @Inject(IQuizGameQueryRepository)
    protected queryGameRepository: IQuizGameQueryRepository,
    @Inject(IQuestionsQueryRepository)
    protected questionsQueryRepository: IQuestionsQueryRepository,
  ) {}

  async joinGame(userId: string): Promise<ViewGame | null> {
    const existsOpenGame = await this.queryGameRepository.checkOpenGame();
    if (!existsOpenGame) {
      return this.gameRepository.createGame(userId);
    }
    return await this.gameRepository.joinGame(userId, existsOpenGame);
  }

  async sendAnswer(
    userId: string,
    dto: AnswerDto,
    gameId: string,
  ): Promise<ViewAnswer | null> {
    const questionsCount = Number(settings.gameRules.questionsCount);
    const currentUserAnswerProgress =
      await this.queryGameRepository.currentGameAnswerProgress(userId, gameId);
    if (currentUserAnswerProgress == questionsCount) {
      return null;
    }

    const correctAnswer = await this.queryGameRepository.getCorrectAnswers(
      gameId,
      currentUserAnswerProgress,
    );

    const isLastQuestions = currentUserAnswerProgress == questionsCount - 1;
    const isCorrectAnswer = correctAnswer.correctAnswers.includes(dto.answer);

    const sendAnswerDto = new SendAnswerDto(
      userId,
      dto.answer,
      gameId,
      correctAnswer.questionId,
      isCorrectAnswer,
      isLastQuestions,
    );
    console.log(gameId);
    console.log(userId);
    if (isLastQuestions) {
      this.eventBus.publish(new DelayedForceGameOverEvent(userId, gameId));
    }

    return await this.gameRepository.sendAnswer(sendAnswerDto);
  }
}

// CREATE OR REPLACE FUNCTION finish_game(game_id INT)
// RETURNS VOID AS
// $$
// DECLARE
// player1_answers INT;
// player2_answers INT;
// player2_time TIMESTAMP;
// unanswered_questions INT;
// BEGIN
// -- Получаем количество ответов каждого игрока и время ответа второго игрока
// SELECT COUNT(*) INTO player1_answers
// FROM game_answers
// WHERE game_id = game_id AND player_number = 1;
//
// SELECT COUNT(*) INTO player2_answers, MIN(answered_at)
// FROM game_answers
// WHERE game_id = game_id AND player_number = 2;
//
// -- Если второй игрок не ответил на все вопросы, завершаем игру
// IF player2_answers < (SELECT COUNT(*) FROM game_questions WHERE game_id = game_id) THEN
// RAISE NOTICE 'Player 2 did not answer all questions, finishing game';
// UPDATE games SET ended_at = NOW() WHERE id = game_id;
//
// -- Считаем неотвеченные вопросы как неправильные ответы второго игрока
// SELECT COUNT(*) INTO unanswered_questions
// FROM game_questions
// WHERE game_id = game_id AND NOT EXISTS (
//     SELECT 1 FROM game_answers WHERE game_id = game_id AND question_id = game_questions.id AND player_number = 2
// );
//
// INSERT INTO game_answers (game_id, player_number, question_id, answer, answered_at)
// SELECT game_id, 2, id, FALSE, NOW()
// FROM game_questions
// WHERE game_id = game_id AND NOT EXISTS (
//     SELECT 1 FROM game_answers WHERE game_id = game_id AND question_id = game_questions.id AND player_number = 2
// );
// ELSE
// -- Если второй игрок ответил на все вопросы, устанавливаем таймер на 10 секунд
// SELECT NOW() + INTERVAL '10 seconds' INTO player2_time;
// PERFORM pg_notify('finish_game', CAST(game_id AS TEXT));
// PERFORM pg_sleep(10);
//
// -- Проверяем, что время не истекло и игра не завершена
// IF NOW() < player2_time AND NOT EXISTS (SELECT 1 FROM games WHERE id = game_id AND ended_at IS NOT NULL) THEN
// RAISE NOTICE 'Player 2 answered all questions, game continues';
// ELSE
// RAISE NOTICE 'Player 2 did not answer all questions in time, finishing game';
// UPDATE games SET ended_at = NOW() WHERE id = game_id;
//
// -- Считаем неотвеченные вопросы как неправильные ответы второго игрока
// SELECT COUNT(*) INTO unanswered_questions
// FROM game_questions
// WHERE game_id = game_id AND NOT EXISTS (
//     SELECT 1 FROM game_answers WHERE game_id = game_id AND question_id = game_questions.id AND player_number = 2
// );
//
// INSERT INTO game_answers (game_id, player_number, question_id, answer, answered_at)
// SELECT game_id, 2, id, FALSE, NOW()
// FROM game_questions
