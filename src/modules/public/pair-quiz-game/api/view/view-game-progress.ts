import { ViewAnswer } from './view-answer';
import { ViewPlayer } from './view-player';

export class ViewGameProgress {
  answers: ViewAnswer[];
  player: ViewPlayer;
  score: number;

  constructor(player: ViewPlayer, answers?, score?: number) {
    this.answers = answers ?? [];
    this.player = player;
    this.score = score ?? 0;
  }
}
