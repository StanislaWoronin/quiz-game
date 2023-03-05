import { CreateQuestionDto } from '../../api/dto/create-question.dto';

export class NewQuestionDto {
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly published: boolean;

  constructor(dto: CreateQuestionDto) {
    this.body = dto.body;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.published = false;
  }
}
