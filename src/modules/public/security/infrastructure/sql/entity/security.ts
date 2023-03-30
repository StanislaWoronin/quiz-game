import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { SqlUsers } from '../../../../../sa/users/infrastructure/sql/entity/users.entity';

@Entity()
export class SqlSecurity {
  @PrimaryColumn('uuid') deviceId: string;

  @Column() deviceTitle: string;

  @Column() ipAddress: string;

  @Column() iat: string;

  @Column() exp: string;

  @ManyToOne(() => SqlUsers, (u) => u.security)
  user: SqlUsers;
  @Column() userId: string;

  constructor(
    userId: string,
    deviceId: string,
    deviceTitle: string,
    ipAddress: string,
    iat: string,
    exp: string,
  ) {
    this.userId = userId;
    this.deviceId = deviceId;
    this.deviceTitle = deviceTitle;
    this.ipAddress = ipAddress;
    this.iat = iat;
    this.exp = exp;
  }
}
