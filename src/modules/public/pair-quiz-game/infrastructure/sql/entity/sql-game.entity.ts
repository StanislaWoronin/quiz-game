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

  @OneToMany(() => SqlQuestions, (q) => q.game)
  questions = SqlQuestions;

  @OneToMany(() => SqlGameProgress, (gp) => gp.game, { cascade: true })
  gameProgress: SqlGameProgress;

  private getQuestionsId(questions: Questions[]): string[] {
    const result = [];
    for (let i = 0, length = questions.length; i < length; i++) {
      result.push(questions[i].id);
    }
    return result;
  }

  constructor(questions: Questions[]) {
    this.id = randomUUID();
    this.status = GameStatus.PendingSecondPlayer;
    this.pairCreatedDate = new Date().toISOString();
    this.startGameDate = null;
    this.finishGameDate = null;
  }
}
