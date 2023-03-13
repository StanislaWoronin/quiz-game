import { CreateQuestionDto } from '../../api/dto/create-question.dto';

export class NewQuestionDto {
  readonly body: string;
  readonly published: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(dto: CreateQuestionDto) {
    this.body = dto.body;
    this.createdAt = new Date().toISOString();
  }
}
