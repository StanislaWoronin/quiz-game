import { CreatedQuestions } from '../api/view/created-questions';
import { CreateQuestionDto } from '../api/dto/create-question.dto';
import { NewQuestionDto } from './dto/new-question.dto';
import { Inject } from '@nestjs/common';
import { IQuestionsRepository } from '../infrastructure/i-questions.repository';

export class QuestionsService {
  constructor(
    @Inject(IQuestionsRepository)
    protected questionsRepository: IQuestionsRepository,
  ) {}

  async createQuestion(
    dto: CreateQuestionDto,
  ): Promise<CreatedQuestions | null> {
    const newQuestion: NewQuestionDto = new NewQuestionDto(dto);
    const answers: string[] = dto.correctAnswers;

    return await this.questionsRepository.createQuestion(newQuestion, answers)
  }
}
