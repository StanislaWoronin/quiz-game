import {Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {SqlGame} from "../../../../../public/pair-quiz-game/infrastructure/sql/entity/sql-game.entity";
import {SqlCorrectAnswers} from "./answers.entity";
import {SqlUserAnswer} from "../../../../../public/pair-quiz-game/infrastructure/sql/entity/sql-user-answer.entity";

@Entity()
export class SqlQuestions {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: 'character varying',
    length: 500,
    nullable: false,
    collation: 'C'
  })
  body: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false
  })
  published: boolean;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  createdAt: string;

  @Column({
    type: 'character varying',
    nullable: true,
    default: null
  })
  updatedAt: string;

  @OneToMany(
    () => SqlCorrectAnswers,
    (a) => a.question,
    { cascade: true }
  )
  correctAnswers: SqlCorrectAnswers

  @ManyToOne(
      () => SqlGame,
      (g) => g.questions
  )
  game: SqlGame

  @OneToMany(
      () => SqlUserAnswer,
      (ua) => ua.question,
      { cascade: true }
  )
  userAnswer: SqlUserAnswer
}