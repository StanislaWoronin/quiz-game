import { ApiProperty } from '@nestjs/swagger';

export class Questions {
  @ApiProperty()
  id: string;
  @ApiProperty()
  body: string;

  constructor(id: string, body: string) {
    this.id = id
    this.body = body
  }
}
