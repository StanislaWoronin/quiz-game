import { ViewAnswer, ViewAnswerSchema } from './view-answer';
import { ViewPlayer } from './view-player';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, id: false, versionKey: false })
export class ViewGameProgress {
  @ApiProperty({ type: [ViewAnswer] })
  @Prop({ type: [ViewAnswerSchema] })
  answers: ViewAnswer[];
  @ApiProperty()
  @Prop({ type: ViewPlayer })
  player: ViewPlayer;
  @ApiProperty()
  @Prop({ type: Number })
  score: number;

  constructor(userId: string, login: string, answers?, score?: number) {
    this.answers = answers ?? [];
    this.player = new ViewPlayer(userId, login);
    this.player = new ViewPlayer(userId, login);
    this.score = score ?? 0;
  }
}

export const ViewGameProgressSchema =
  SchemaFactory.createForClass(ViewGameProgress);
