import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlUsers } from '../../../../../sa/users/infrastructure/sql/entity/users.entity';
import { SqlQuestions } from '../../../../../sa/questions/infrastructure/sql/entity/questions.entity';
import { SqlGame } from './sql-game.entity';
import { SendAnswerDto } from '../../../applications/dto/send-answer.dto';
import { randomUUID } from 'crypto';
import { AnswerStatus } from '../../../shared/answer-status';

@Entity()
export class SqlUserAnswer {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => SqlUsers, (u) => u.answers)
  @JoinColumn()
  user: SqlUsers;
  @Column() userId: string;

  @ManyToOne(() => SqlQuestions, (q) => q.userAnswer)
  @JoinColumn()
  question: SqlQuestions;
  @Column()
  questionId: string;

  @ManyToOne(() => SqlGame, (g) => g.userAnswer)
  @JoinColumn()
  game: SqlGame;
  @Column()
  gameId: string;

  @Column()
  userAnswer: string;

  @Column()
  answerStatus: AnswerStatus;

  @Column()
  addedAt: string;

  constructor(
    userId: string,
    gameId: string,
    questionsId: string,
    answer: string,
    answerStatus: AnswerStatus,
  ) {
    this.userId = userId;
    this.gameId = gameId;
    this.questionId = questionsId;
    this.userAnswer = answer;
    this.answerStatus = answerStatus;
    this.addedAt = new Date().toISOString();
  }
}
