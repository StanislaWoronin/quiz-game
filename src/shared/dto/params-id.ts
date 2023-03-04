import { IsString, IsUUID } from "class-validator";

export class ParamsId {
  @IsString()
  @IsUUID()
  id: string
}