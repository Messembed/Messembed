import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeepPartial,
} from 'typeorm';

@Entity({
  name: 'chats',
})
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  title: string;

  @Column()
  active: boolean;

  constructor(data: DeepPartial<Chat>) {
    Object.assign(this, data);
  }
}
