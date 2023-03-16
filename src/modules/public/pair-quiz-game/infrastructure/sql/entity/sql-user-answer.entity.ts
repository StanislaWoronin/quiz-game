import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {SqlUsers} from "../../../../../sa/users/infrastructure/sql/entity/users.entity";
import {SqlQuestions} from "../../../../../sa/questions/infrastructure/sql/entity/questions.entity";

@Entity()
export class SqlUserAnswer {
    @ManyToOne(
        () => SqlUsers,
        (u) => u.answers,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn()
    user: SqlUsers
    @PrimaryColumn() userId: string;

    @ManyToOne(
        () => SqlQuestions,
        (q) => q.userAnswer,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn()
    question: SqlQuestions;
    @Column()
    questionId: string;

}