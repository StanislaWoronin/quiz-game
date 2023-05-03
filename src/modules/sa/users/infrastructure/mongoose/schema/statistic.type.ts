import {Prop, Schema} from "@nestjs/mongoose";

@Schema({ _id: false, versionKey: false })
export class Statistic {
  @Prop({ required: false, type: Number, default: 0 })
  sumScore: number;

  @Prop({ required: false, type: Number, default: 0 })
  gamesCount: number;

  @Prop({ required: false, type: Number, default: 0 })
  winsCount: number;

  @Prop({ required: false, type: Number, default: 0 })
  lossesCount: number;

  @Prop({ required: false, type: Number, default: 0 })
  drawsCount: number;
}
