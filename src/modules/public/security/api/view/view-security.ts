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

  constructor(session: {
    deviceId: string;
    deviceTitle: string;
    ipAddress: string;
    iat: string;
  }) {
    this.deviceId = session.deviceId;
    this.title = session.deviceTitle;
    this.ip = session.ipAddress;
    this.lastActiveDate = session.iat;
  }
}
