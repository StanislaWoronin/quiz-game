import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdatePublishStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  published: boolean
}