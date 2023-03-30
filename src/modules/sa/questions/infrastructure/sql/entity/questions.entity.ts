import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlUserAnswer } from '../../../../../public/pair-quiz-game/infrastructure/sql/entity/sql-user-answer.entity';
import { SqlGameQuestions } from '../../../../../public/pair-quiz-game/infrastructure/sql/entity/sql-game-questions.entity';

@Entity()
export class SqlQuestions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 500,
    nullable: false,
    collation: 'C',
  })
  body: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  published = false;

  @Column({
    type: 'character varying',
    nullable: false,
    default: new Date().toISOString(),
  })
  createdAt: string = new Date().toISOString();

  @Column({
    type: 'character varying',
    nullable: true,
    default: null,
  })
  updatedAt: string;

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  correctAnswers: string[];

  // @OneToMany(() => SqlCorrectAnswers, (a) => a.question, { cascade: true })
  // correctAnswers: SqlCorrectAnswers[];

  // @ManyToOne(() => SqlGame, (g) => g.gameQuestions)
  // game: SqlGame;

  @OneToMany(() => SqlGameQuestions, (gq) => gq.question)
  game: SqlGameQuestions;

  @OneToMany(() => SqlUserAnswer, (ua) => ua.question, { cascade: true })
  userAnswer: SqlUserAnswer[];

  constructor(body: string, answers: string[]) {
    this.body = body;
    this.correctAnswers = answers;
  }
}
