import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeepPartial,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'chats',
})
export class Chat {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: 'string', format: 'datetime' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'datetime' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  active: boolean;

  constructor(data: DeepPartial<Chat>) {
    Object.assign(this, data);
  }
}
