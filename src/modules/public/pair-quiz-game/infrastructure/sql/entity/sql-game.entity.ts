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
import { SqlUserAnswer } from './sql-user-answer.entity';
import { SqlGameQuestions } from './sql-game-questions.entity';

@Entity()
export class SqlGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: GameStatus.PendingSecondPlayer,
  })
  status: GameStatus;

  @Column({
    default: new Date().toISOString(),
  })
  pairCreatedDate: string;

  @Column({
    nullable: true,
  })
  startGameDate: string;

  @Column({
    nullable: true,
  })
  finishGameDate: string;

  // @Column({
  //   type: "uuid",
  //   array: true,
  //   default: [],
  // })
  // questions: string[]

  // @OneToMany(() => SqlQuestions, (q) => q.game)
  // gameQuestions = SqlQuestions[]

  @OneToMany(() => SqlGameProgress, (gp) => gp.game, { cascade: true })
  gameProgress: SqlGameProgress[];

  @OneToMany(() => SqlUserAnswer, (g) => g.game)
  userAnswer: SqlUserAnswer[];

  @OneToMany(() => SqlGameQuestions, (gq) => gq.game)
  questions: SqlGameQuestions;

  constructor() {
    this.id = randomUUID();
    this.status = GameStatus.PendingSecondPlayer;
    this.pairCreatedDate = new Date().toISOString();
    this.startGameDate = null;
    this.finishGameDate = null;
  }
}
