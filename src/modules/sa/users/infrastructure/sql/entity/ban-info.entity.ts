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
    banDate: string;


    @Column({
        type: 'character varying',
        nullable: true,
        collation: 'C'
    })
    banReason: string;

    @OneToOne(
      () => Users,
      (u) => u.banInfo,
      { onDelete: 'CASCADE' })
    @JoinColumn()
    user: Users;
    @PrimaryColumn() userId: string;
}