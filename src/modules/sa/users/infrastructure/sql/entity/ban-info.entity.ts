import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlUsers } from './users.entity';

@Entity({name: 'sql_user_ban_info'})
export class SqlUserBanInfo {
  @Column({
    type: 'character varying',
    nullable: true,
    collation: 'C',
  })
  banDate: string;

  @Column({
    type: 'character varying',
    nullable: true,
    collation: 'C',
  })
  banReason: string;

  @OneToOne(() => SqlUsers, (u) => u.banInfo)
  @JoinColumn()
  user: SqlUsers;
  @PrimaryColumn() userId: string;
}
