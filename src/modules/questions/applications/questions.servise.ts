import { CreatedQuestions } from "../api/view/created-questions";
import { CreateQuestionsDto } from "../api/dto/create-questions.dto";
import { NewQuestionDto } from "./dto/new-question.dto";
import { randomUUID } from "crypto";
import { Inject } from "@nestjs/common";
import { IQuestionsRepository } from "../infrastructure/i-questions.repository";

export class QuestionsService {
  constructor(
    @Inject(IQuestionsRepository) protected questionsRepository: IQuestionsRepository
  ) {
  }

  async createQuestion(dto: CreateQuestionsDto): Promise<CreatedQuestions | null> {
    const newQuestion: NewQuestionDto = new NewQuestionDto(dto)

    return {
      id: randomUUID(),
      body: newQuestion.body,
      correctAnswers: newQuestion.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}