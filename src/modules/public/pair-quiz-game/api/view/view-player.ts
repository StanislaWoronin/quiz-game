import {ApiProperty} from "@nestjs/swagger";

export class ViewPlayer {
  @ApiProperty()
  id: string;
  @ApiProperty()
  login: string;

  constructor(userId: string, login: string) {
    this.id = userId;
    this.login = login;
  }
}
