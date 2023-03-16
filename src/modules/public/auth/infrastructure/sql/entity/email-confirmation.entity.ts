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

  constructor(isAdmin: boolean) {
    if (isAdmin) {
      this.confirmationCode = null;
      this.expirationDate = null;
      this.isConfirmed = true;
    } else {
      this.confirmationCode = randomUUID();
      this.expirationDate = add(new Date(), {
        hours: Number(settings.timeLife.CONFIRMATION_CODE),
      }).toISOString();
      this.isConfirmed = false;
    }
  }
}
