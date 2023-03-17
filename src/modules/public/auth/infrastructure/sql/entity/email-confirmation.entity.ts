import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { SqlUsers } from '../../../../../sa/users/infrastructure/sql/entity/users.entity';
import { randomUUID } from 'crypto';
import add from 'date-fns/add';
import { settings } from '../../../../../../settings';

@Entity()
export class SqlEmailConfirmation {
  @Column({ default: null })
  confirmationCode: string | null;

  @Column({ default: null })
  expirationDate: string | null;

  @Column({ default: false })
  isConfirmed: boolean;

  @OneToOne(() => SqlUsers, (u) => u.emailConfirmation)
  @PrimaryColumn()
  userId: string;

  constructor(id: string, isConfirmed: boolean, confirmationCode?: string, expirationDate?: string, ) {
    this.userId = id
    this.confirmationCode = confirmationCode ?? null;
    this.expirationDate = expirationDate ?? null;
    this.isConfirmed = isConfirmed;
  }
}
