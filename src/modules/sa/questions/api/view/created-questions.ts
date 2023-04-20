import { MongoQuestion } from '../../infrastructure/mongoose/schema/question.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatedQuestions {
  @ApiProperty()
  readonly id: string;
  @ApiProperty()
  readonly body: string;
  @ApiProperty({
    isArray: true,
    example: [
      'possible fist answer',
      'possible second answer',
      'possible third answer',
    ],
  })
  readonly correctAnswers: string[];
  @ApiProperty({ default: false })
  readonly published: boolean;
  @ApiProperty({
    example: '2023-04-20T10:45:05.185Z',
    description: 'Question creation date in IsoString format',
  })
  readonly createdAt: string;
  @ApiProperty({
    example: '2023-04-21T10:45:05.185Z',
    description: 'Question update  date in IsoString format',
  })
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
