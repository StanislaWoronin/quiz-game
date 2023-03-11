import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {Users} from "./users.entity";

@Entity()
export class Credentials {
    @Column({
        type: 'character varying',
        nullable: false,
    })
    credentials: string;

    @OneToOne(
      () => Users,
      (u) => u.credentials,
      { onDelete: 'CASCADE' })
    @JoinColumn()
    user: Users;
    @PrimaryColumn() userId: string;
}
