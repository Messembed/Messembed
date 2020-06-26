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

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
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
