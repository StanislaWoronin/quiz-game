import {isUUID} from "class-validator";
import {Transform} from "class-transformer";
import {BadRequestException} from "@nestjs/common";

export class ParamsId {
  @Transform(({value}) => {
    if (isUUID(value)) return value
    throw new BadRequestException()
  })
  id: string;
}
