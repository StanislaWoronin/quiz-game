import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SqlUsers } from '../../../../../sa/users/infrastructure/sql/entity/users.entity';
import { SqlQuestions } from '../../../../../sa/questions/infrastructure/sql/entity/questions.entity';
import {SqlGame} from "./sql-game.entity";
import {SendAnswerDto} from "../../../applications/dto/send-answer.dto";
import {randomUUID} from "crypto";

@Entity()
export class SqlUserAnswer {
  @ManyToOne(() => SqlUsers, (u) => u.answers)
  @JoinColumn()
  user: SqlUsers;
  @PrimaryColumn() userId: string;

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
  addedAt: string;

  constructor(
      userId: string,
      gameId: string,
      questionsId: string,
      answer: string
  ) {
    this.userId = userId
    this.gameId = gameId
    this.questionId = questionsId
    this.userAnswer = answer
    this.addedAt = new Date().toISOString()
  }
}
