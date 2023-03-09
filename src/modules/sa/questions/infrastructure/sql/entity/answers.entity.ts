import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Questions } from "./questions.entity";

@Entity()
export class Answers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  correctAnswer: string;

  @ManyToOne(
    () => Questions,
    (q) => q.correctAnswers,
    { onDelete: 'CASCADE' })
  question: Questions;
  @Column({
    nullable: false,
  })
  questionId: string
}