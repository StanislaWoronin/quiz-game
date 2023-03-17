import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import {SqlUsers} from "./users.entity";

@Entity()
export class EmailConfirmation {
  @Column({ default: null }) confirmationCode: string | null;

  @Column({ default: null }) expirationDate: string | null;

  @Column({ default: false }) isConfirmed: boolean;

  @OneToOne(() => SqlUsers, (u) => u.emailConfirmation)
  user: SqlUsers;
  @PrimaryColumn() userId: string;

  constructor() {
  }
}
