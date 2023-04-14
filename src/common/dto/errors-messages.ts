import { ApiProperty } from '@nestjs/swagger';

export class ErrorsMessages {
  errorsMessages: {
    message: string;
    field: string;
  }[];
}

class Message {
  @ApiProperty()
  message: string;
  @ApiProperty()
  field: string;
}

export class BadRequestResponse {
  @ApiProperty()
  errorsMessages: Message;
}
