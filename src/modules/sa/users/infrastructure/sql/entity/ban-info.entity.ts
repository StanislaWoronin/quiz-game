import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Users} from "./users.entity";

@Entity()
export class UserBanInfo {
    @Column({
        type: 'boolean',
    })
    isBanned: boolean;

    @Column({
        type: 'character varying',
        nullable: true,
        collation: 'C'
    })
    banDate: boolean;


    @Column({
        type: 'character varying',
        nullable: true,
        collation: 'C'
    })
    banReason: boolean;

    @OneToOne(() => Users, (u) => u.banInfo)
    @JoinColumn()
    user: Users;
    @PrimaryColumn() userId: string;
}