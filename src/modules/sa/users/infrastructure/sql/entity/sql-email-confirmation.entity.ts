import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { SqlUsers } from './users.entity';

@Entity({ name: 'sql_email_confirmation' })
export class SqlEmailConfirmation {
  @Column({ default: null })
  confirmationCode: string | null;

  @Column({ default: null })
  expirationDate: string | null;

  @Column({ default: false })
  isConfirmed: boolean;

  @OneToOne(() => SqlUsers, (u) => u.emailConfirmation)
  @JoinColumn()
  user: SqlUsers;
  @PrimaryColumn('uuid') userId: string;

  constructor(
    userId: string,
    isConfirmed: boolean,
    confirmationCode?: string,
    expirationDate?: string,
  ) {
    this.userId = userId;
    this.isConfirmed = isConfirmed;
    this.confirmationCode = confirmationCode;
    this.expirationDate = expirationDate;
  }
}
