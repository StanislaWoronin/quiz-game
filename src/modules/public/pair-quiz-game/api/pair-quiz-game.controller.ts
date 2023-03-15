import {
    Body,
    Controller, ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards
} from "@nestjs/common";
import {ViewGame} from "./view/view-game";
import {ViewGameProgress} from "./view/view-game-progress";
import {AnswerDto} from "./dto/answer.dto";
import {ViewAnswer} from "./view/view-answer";
import {PairQuizGameService} from "../applications/pair-quiz-game.service";
import {UserId} from "../../../../common/decorators/user.decorator";
import {LocalAuthGuard} from "../../../../common/guards/local-auth.guard";

@UseGuards(LocalAuthGuard)
@Controller('pair-game-quiz/pair')
export class PairQuizGameController {
    constructor(
        protected gameService : PairQuizGameService

    ) {
    }

    @Post('connection')
    async joinGame(
        @UserId() userId: string,
    ): Promise<ViewGameProgress| ViewGame> {
        const result = await this.gameService.joinGame(userId)
        if (!result) {
            throw new ForbiddenException()
        }

        return result
    }

    @Post('answers')
    async sendAnswer(
        @Body() dto: AnswerDto,
        @UserId() userId: string,
    ): Promise<ViewAnswer> {
        const result = await this.gameService.sendAnswer(userId, dto)
        if (!result) {
            throw new ForbiddenException()
        }

        return result
    }

    @HttpCode(HttpStatus.OK)
    @Get('my-current')
    async getMyCurrentGame(): Promise<ViewGameProgress| ViewGame> {

    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async getGameById(
        @Param('id') gameId: string
    ): Promise<ViewGameProgress| ViewGame> {

    }
}