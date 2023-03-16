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
  @JoinColumn()
  user: SqlUsers;
  @PrimaryColumn() userId: string;
}
