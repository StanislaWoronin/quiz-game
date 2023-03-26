import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlQuestions } from './questions.entity';
import { SqlUsers } from '../../../../users/infrastructure/sql/entity/users.entity';
import { CreateQuestionDto } from "../../../api/dto/create-question.dto";

@Entity()
export class SqlCorrectAnswers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  correctAnswer: string;

  @ManyToOne(() => SqlQuestions, (q) => q.correctAnswers)
  question: SqlQuestions;
  @Column()
  questionId: string


  constructor(questionId: string, el: string) {
    this.questionId = questionId
    this.correctAnswer = el
  }
} // TODO not use
