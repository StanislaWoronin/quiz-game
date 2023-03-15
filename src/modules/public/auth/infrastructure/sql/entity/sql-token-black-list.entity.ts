import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SqlTokenBlackList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;
}
