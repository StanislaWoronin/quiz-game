import { AnswerStatus } from '../../shared/answer-status';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, id: false, versionKey: false })
export class ViewAnswer {
  @ApiProperty()
  @Prop({ type: String })
  questionId: string;
  @ApiProperty()
  @Prop({ type: String, enum: AnswerStatus })
  answerStatus: AnswerStatus;
  @ApiProperty({ example: '2023-04-20T10:45:05.185Z' })
  @Prop({ type: String })
  addedAt: string;

  constructor(questionId: string, answerStatus: AnswerStatus, addedAt: string) {
    this.questionId = questionId;
    this.answerStatus = answerStatus;
    this.addedAt = addedAt;
  }
}

export const ViewAnswerSchema = SchemaFactory.createForClass(ViewAnswer);
