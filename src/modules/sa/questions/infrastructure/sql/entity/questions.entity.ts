import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Answers } from "./answers.entity";

@Entity()
export class Questions {
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
    nullable: false,
  })
  updatedAt: string;

  @OneToMany(
    () => Answers,
    (a) => a.question,
    { cascade: true })
  correctAnswers: Answers
}