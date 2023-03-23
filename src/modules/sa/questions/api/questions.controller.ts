import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthBasicGuard } from '../../../public/auth/guards/auth-basic.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreatedQuestions } from './view/created-questions';
import { QuestionsService } from '../applications/questions.servise';
import { IQuestionsQueryRepository } from '../infrastructure/i-questions-query.repository';
import { ViewPage } from '../../../../common/pagination/view-page';
import { QuestionsQueryDto } from './dto/query/questions-query.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdatePublishStatusDto } from './dto/update-publish-status.dto';
import { ViewQuestion } from './view/view-question';

@UseGuards(AuthBasicGuard)
@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor(
    protected questionsService: QuestionsService,
    @Inject(IQuestionsQueryRepository)
    protected questionsQueryRepository: IQuestionsQueryRepository,
  ) {}

  @Post()
  async createQuestion(
    @Body() dto: CreateQuestionDto,
  ): Promise<CreatedQuestions> {
    return await this.questionsService.createQuestion(dto);
  }

  @Get()
  async getQuestions(
    @Query() query: QuestionsQueryDto,
  ): Promise<ViewPage<ViewQuestion>> {
    return await this.questionsQueryRepository.getQuestions(query);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateQuestion(
    @Param('id') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    const isUpdated = await this.questionsService.updateQuestion(
      questionId,
      dto,
    );

    if (isUpdated === null) {
      throw new NotFoundException();
    }
    if (!isUpdated) {
      throw new BadRequestException();
    }
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/publish')
  async updatePublishStatus(
    @Param('id') questionId: string,
    @Body() dto: UpdatePublishStatusDto,
  ) {
    const isUpdated = await this.questionsService.updatePublishStatus(
      questionId,
      dto,
    );

    if (isUpdated === null) {
      throw new NotFoundException();
    }
    if (!isUpdated) {
      throw new BadRequestException();
    }
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteQuestion(@Param('id') questionId: string) {
    const isDeleted = await this.questionsService.deleteQuestion(questionId);

    if (!isDeleted) {
      throw new NotFoundException();
    }
    return;
  }
}
