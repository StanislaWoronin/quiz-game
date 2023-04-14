import { GameQueryDto } from '../../api/dto/query/game-query.dto';
import { GameStatus } from '../../shared/game-status';

export type gameQueryOptions = Partial<{
  _gameIdFilter: boolean;
  gameStatus: GameStatus | GameStatus[];
  dto: GameQueryDto;
}>;
