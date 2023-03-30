import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlGame } from './sql-game.entity';
import { SqlQuestions } from '../../../../../sa/questions/infrastructure/sql/entity/questions.entity';

@Entity()
export class SqlGameQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SqlGame, (g) => g.questions)
  @JoinColumn()
  game: SqlGame;
  @Column()
  gameId: string;

  @ManyToOne(() => SqlQuestions, (q) => q.game)
  @JoinColumn()
  question: SqlQuestions;
  @Column()
  questionId: string;

  constructor(gameId: string, questionId: string) {
    this.gameId = gameId;
    this.questionId = questionId;
  }
}
