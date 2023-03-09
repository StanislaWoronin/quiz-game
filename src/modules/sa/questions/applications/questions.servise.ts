import { CreatedQuestions } from '../api/view/created-questions';
import { CreateQuestionDto } from '../api/dto/create-question.dto';
import { NewQuestionDto } from './dto/new-question.dto';
import {Inject, Injectable} from '@nestjs/common';
import { IQuestionsRepository } from '../infrastructure/i-questions.repository';
import { UpdatePublishStatusDto } from "../api/dto/update-publish-status.dto";
import { IQuestionsQueryRepository } from "../infrastructure/i-questions-query.repository";
import { UpdateQuestionDto } from "../api/dto/update-question.dto";
import {ParamsId} from "../../../../shared/dto/params-id";

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(IQuestionsRepository)
    protected questionsRepository: IQuestionsRepository,
    @Inject(IQuestionsQueryRepository)
    protected questionsQueryRepository: IQuestionsQueryRepository,
  ) {}

  async createQuestion(
    dto: CreateQuestionDto,
  ): Promise<CreatedQuestions | null> {
    const newQuestion: NewQuestionDto = new NewQuestionDto(dto);
    const answers: string[] = dto.correctAnswers;

    return await this.questionsRepository.createQuestion(newQuestion, answers);
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto
  ): Promise<boolean | null> {
    const isExists = await this.questionsQueryRepository.questionExists(questionId);

    if(isExists === null) return null
    if(isExists && !dto.correctAnswers.length) return false // if question "published" and correctAnswers = [] return false

    return await this.questionsRepository.updateQuestion(questionId, dto);
  }

  async updatePublishStatus(
    questionId: string,
    dto: UpdatePublishStatusDto
  ): Promise<boolean> {
    return await this.questionsRepository.updatePublishStatus(questionId, dto.published);
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    return await this.questionsRepository.deleteQuestion(questionId)
  }
}
