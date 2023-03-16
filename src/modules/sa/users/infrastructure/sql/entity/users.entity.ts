import {Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {SqlUserBanInfo} from "./ban-info.entity";
import {SqlCredentials} from "./credentials.entity";
import {SqlGameProgress} from "../../../../../public/pair-quiz-game/infrastructure/sql/entity/sql-game-progress.entity";
import {SqlUserAnswer} from "../../../../../public/pair-quiz-game/infrastructure/sql/entity/sql-user-answer.entity";

@Entity()
export class SqlUsers {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: 'character varying',
        length: 10,
        nullable: false,
        collation: 'C'
    })
    login: string;

    @Column({
        type: 'character varying',
        nullable: false,
        collation: 'C'
    })
    email: string;

    @Column({
        type: 'character varying',
        nullable: false,
        collation: 'C'
    })
    createdAt: string;

    @OneToOne(
      () => SqlUserBanInfo,
      (bi) => bi.user,
      { cascade: true })
    banInfo: SqlUserBanInfo;

    @OneToOne(
      () => SqlCredentials,
      (c) => c.user,
      { cascade: true }
    )
    credentials: SqlCredentials;

    @OneToMany(
        () => SqlGameProgress,
        (gp) => gp.user
    )
    gameProgress: SqlGameProgress

    @OneToMany(
        () => SqlUserAnswer,
        a => a.user,
        { cascade: true }
    )
    answers: SqlUserAnswer
}