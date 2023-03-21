import {TestingRequestDto} from "../testing-request.dto";
import {ViewGame} from "../../../src/modules/public/pair-quiz-game/api/view/view-game";

export class Game {
    constructor(private readonly server: any) {}

    async joinGame(token: string): Promise<TestingRequestDto<ViewGame>> {
        // TODO continue
    }
}