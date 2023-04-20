import { ViewAnswer } from './view-answer';
import { ViewPlayer } from './view-player';
import { ApiProperty } from '@nestjs/swagger';

export class ViewGameProgress {
  @ApiProperty({ type: [ViewAnswer] })
  answers: ViewAnswer[];
  @ApiProperty()
  player: ViewPlayer;
  @ApiProperty()
  score: number;

  constructor(userId: string, login: string, answers?, score?: number) {
    this.answers = answers ?? [];
    this.player = new ViewPlayer(userId, login);
    this.player = new ViewPlayer(userId, login);
    this.score = score ?? 0;
  }
}
