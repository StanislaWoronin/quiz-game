import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlQuestions } from '../../../../../sa/questions/infrastructure/sql/entity/questions.entity';
import { GameStatus } from '../../../shared/game-status';
import { SqlGameProgress } from './sql-game-progress.entity';
import { randomUUID } from 'crypto';
import { Questions } from '../../../shared/questions';
import {SqlUserAnswer} from "./sql-user-answer.entity";

@Entity()
export class SqlGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: GameStatus;

  @Column()
  pairCreatedDate: string;

  @Column()
  startGameDate: string;

  @Column()
  finishGameDate: string;

  @Column({
    type: "text",
    array: true,
    default: []
  })
  questions: string[]

  @OneToMany(() => SqlQuestions, (q) => q.game)
  gameQuestions = SqlQuestions;

  @OneToMany(() => SqlGameProgress, (gp) => gp.game, { cascade: true })
  gameProgress: SqlGameProgress;

  @OneToMany(() => SqlUserAnswer, (g) => g.game)
  userAnswer: SqlUserAnswer

  constructor(questions: string[]) {
    this.id = randomUUID();
    this.status = GameStatus.PendingSecondPlayer;
    this.pairCreatedDate = new Date().toISOString();
    this.startGameDate = null;
    this.finishGameDate = null;
    this.questions = questions
  }
}
