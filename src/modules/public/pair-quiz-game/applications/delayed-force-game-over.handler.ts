import {EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {DelayedForceGameOverEvent} from "./dto/delayed-force-game-over.event";
import {Timeout} from "@nestjs/schedule";
import {Inject} from "@nestjs/common";
import {IQuizGameRepository} from "../infrastructure/i-quiz-game.repository";
import {sleep} from "../../../../../test/helpers/helpers";

@EventsHandler(DelayedForceGameOverEvent)
export class DelayedForceGameOverHandler implements IEventHandler<DelayedForceGameOverEvent> {
    constructor(
        @Inject(IQuizGameRepository)
        protected gameRepository: IQuizGameRepository,
    ) {
    }

    async handle(event: DelayedForceGameOverEvent) {
        await sleep(10)
        const currentTime = Date.now()
        this.gameRepository.forceGameOver(event)
    }
}