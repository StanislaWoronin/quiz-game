export class DelayedForceGameOverEvent {
    userId: string
    gameId: string
    constructor(userId: string, gameId: string) {
        this.userId = userId
        this.gameId = gameId
    }
}
