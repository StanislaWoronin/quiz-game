import { SqlUsers } from '../../../../sa/users/infrastructure/sql/entity/users.entity';
import {ApiProperty} from "@nestjs/swagger";

export class ViewAboutMe {
  @ApiProperty({example: '1b8f6bf3-fd4a-4803-b3b1-b61573f1306c', description: 'Unique user ID'})
  readonly userId: string;
  @ApiProperty({example: 'UserLogin', description: 'User`s login'})
  readonly login: string;
  @ApiProperty({example: 'someone@mail.com', description: 'User`s email'})
  readonly email: string;

  constructor(user: SqlUsers) {
    this.userId = user.id;
    this.login = user.login;
    this.email = user.email;
  }
}
