import { CreateQuestionsDto } from "../../api/dto/create-questions.dto";

export class NewQuestionDto {
  readonly body: string;
  readonly  correctAnswers: [];
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(dto: CreateQuestionsDto) {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}