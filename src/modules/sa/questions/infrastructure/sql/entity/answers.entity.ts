import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { SqlQuestions } from "./questions.entity";

@Entity()
export class SqlAnswers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  correctAnswer: string;

  @ManyToOne(
    () => SqlQuestions,
    (q) => q.correctAnswers,
    { onDelete: 'CASCADE' })
  question: SqlQuestions;
  @Column({
    nullable: false,
  })
  questionId: string
}