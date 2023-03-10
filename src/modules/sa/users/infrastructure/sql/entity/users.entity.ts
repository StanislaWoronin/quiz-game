import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserBanInfo} from "./ban-info.entity";
import {Credentials} from "./credentials.entity";

@Entity()
export class Users {
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

    @OneToOne(() => UserBanInfo, (bi) => bi.user)
    banInfo: UserBanInfo;

    @OneToOne(() => Credentials, (c) => c.user)
    credentials: Credentials;
}