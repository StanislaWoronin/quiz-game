import {Body, Controller, Post, UseGuards} from "@nestjs/common";
import {AuthBasicGuard} from "../../../guards/auth-basic.guard";
import {CreateQuestionsDto} from "./dto/create-questions.dto";
import {CreatedQuestions} from "./view/created-questions";

@UseGuards(AuthBasicGuard)
@Controller('questions')
export class QuestionsController {
    constructor(

    ) {
    }

    @Post()
    async createQuestions(
        @Body() dto: CreateQuestionsDto
    ): Promise<CreatedQuestions> {

    }
}