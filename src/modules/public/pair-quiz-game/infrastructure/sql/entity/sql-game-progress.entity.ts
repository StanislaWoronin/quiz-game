import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlUsers } from '../../../../../sa/users/infrastructure/sql/entity/users.entity';
import { SqlGame } from './sql-game.entity';

@Entity()
export class SqlGameProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SqlGame, (g) => g.gameProgress, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: SqlGame;
  @Column() gameId: string;

  @ManyToOne(() => SqlUsers, (u) => u.gameProgress)
  @JoinColumn()
  user: SqlUsers;
  @Column() userId: string;

  @Column({
    default: 0,
  })
  score: number;

  @Column({
    default: false,
  })
  gameHost: boolean;

  constructor(gameId: string, userId: string, gameHost?: boolean) {
    this.gameId = gameId;
    this.userId = userId;
    this.gameHost = gameHost;
  }
}
