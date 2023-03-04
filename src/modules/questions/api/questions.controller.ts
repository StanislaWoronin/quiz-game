import {
    Body,
    Controller, Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {AuthBasicGuard} from "../../../guards/auth-basic.guard";
import {CreateQuestionsDto} from "./dto/create-questions.dto";
import {CreatedQuestions} from "./view/created-questions";
import { QuestionsService } from "../applications/questions.servise";
import { IQuestionsQueryRepository } from "../infrastructure/i-questions-query.repository";
import { ViewPage } from "../../../shared/pagination/view-page";
import { QueryParametersDto } from "../../../shared/pagination/query-parameters/query-parameters.dto";
import { ParamsId } from "../../../shared/dto/params-id";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { UpdatePublishStatusDto } from "./dto/update-publish-status.dto";

@UseGuards(AuthBasicGuard)
@Controller('sa/quiz/questions')
export class QuestionsController {
    constructor(
      protected questionsService: QuestionsService,
      @Inject(IQuestionsQueryRepository) protected questionsQueryRepository: IQuestionsQueryRepository
    ) {
    }

    @HttpCode(HttpStatus.OK)
    @Post()
    async createQuestion(
        @Body() dto: CreateQuestionsDto
    ): Promise<CreatedQuestions> {
        return await this.questionsService.createQuestion(dto)
    }

    @Get()
    async getAllQuestions(
      @Query() query: QueryParametersDto
    ): Promise<ViewPage<CreatedQuestions>> {
        return await this.questionsQueryRepository.getAllQuestions(query)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('id')
    async updateQuestion(
      @Param('id') questionId: ParamsId,
      @Body() dto: UpdateQuestionDto
    ) {
        return true
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('id')
    async updatePublishStatus(
      @Param('id') questionId: ParamsId,
      @Body() dto: UpdatePublishStatusDto
    ) {
        return true
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('id')
    async deleteQuestion(
      @Param('id') questionId: ParamsId,
    ) {
        return true
    }
}