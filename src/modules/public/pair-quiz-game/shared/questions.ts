import {ApiProperty} from "@nestjs/swagger";

export class Questions {
  @ApiProperty()
  id: string;
  @ApiProperty()
  body: string;
}
