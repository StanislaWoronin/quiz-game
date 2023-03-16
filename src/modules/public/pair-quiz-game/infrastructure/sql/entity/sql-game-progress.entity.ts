import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SqlUsers } from '../../../../../sa/users/infrastructure/sql/entity/users.entity';
import { SqlGame } from './sql-game.entity';

@Entity()
export class SqlGameProgress {
  @ManyToOne(() => SqlGame, (g) => g.gameProgress, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: SqlGame;
  @PrimaryColumn() gameId: string;

  @ManyToOne(() => SqlUsers, (u) => u.gameProgress)
  @JoinColumn()
  user: SqlUsers;
  @Column() userId: string;

  @Column({
    default: null,
  })
  score: number;

  constructor(gameId: string, userId: string) {
    this.gameId = gameId;
    this.userId = userId;
  }
}
