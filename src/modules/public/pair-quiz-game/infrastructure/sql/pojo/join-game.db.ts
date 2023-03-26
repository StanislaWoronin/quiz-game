import { GameStatus } from "../../../shared/game-status";

export class JoinGameDb {
  id: string
  status: GameStatus
  pairCreatedDate: string
  startGameDate: string
  finishGameDate: string
  userId: string
  login: string
  questionId: string
  body: string
}