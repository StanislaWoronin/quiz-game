import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { SqlUsers } from './users.entity';

@Entity()
export class SqlCredentials {
  @Column({
    type: 'character varying',
    nullable: false,
  })
  credentials: string;

  @OneToOne(() => SqlUsers, (u) => u.credentials, { onDelete: 'CASCADE' })
  user: SqlUsers;
  @PrimaryColumn("uuid") userId: string;

  constructor(userId: string, credentials: string) {
    this.userId = userId
    this.credentials = credentials
  }
}
