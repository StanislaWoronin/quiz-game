import { ApiProperty } from '@nestjs/swagger';

export class ViewSecurity {
  @ApiProperty()
  deviceId: string;
  @ApiProperty({
    example: 'Mozilla/5.0',
    description: 'You can take title in request header.',
  })
  title: string;
  @ApiProperty()
  ip: string;
  @ApiProperty()
  lastActiveDate: string;
}
