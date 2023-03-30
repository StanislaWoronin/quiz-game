import { MongoQuestion } from '../../infrastructure/mongoose/schema/question.schema';

export class CreatedQuestions {
  readonly id: string;
  readonly body: string;
  readonly correctAnswers: string[];
  readonly published: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(createdQuestions: MongoQuestion) {
    this.id = createdQuestions.id;
    this.body = createdQuestions.body;
    this.correctAnswers = createdQuestions.correctAnswers.map(
      (el) => el.correctAnswer,
    );
    this.published = false;
    this.createdAt = createdQuestions.createdAt;
    this.updatedAt = null;
  }
}
