import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlUsers } from './users.entity';

@Entity()
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

  @OneToOne(() => SqlUsers, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: SqlUsers;
  @PrimaryColumn() userId: string;
}
