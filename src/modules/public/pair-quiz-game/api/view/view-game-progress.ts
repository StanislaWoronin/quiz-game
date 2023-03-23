import { ViewAnswer } from './view-answer';
import { ViewPlayer } from './view-player';

export class ViewGameProgress {
  answers: ViewAnswer[];
  player: ViewPlayer;
  score: number;

  constructor(userId: string, login: string, answers?, score?: number) {
    this.answers = answers ?? [];
    this.player = new ViewPlayer(userId, login);
    this.score = score ?? 0;
  }
}
