import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeepPartial,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/User.entity';
import { Message } from '../../messages/entities/Message.entity';
import { Exclude } from 'class-transformer';

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

  @ApiPropertyOptional({ type: 'string', format: 'ISO 8061' })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  active: boolean;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false })
  firstCompanionId: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false })
  secondCompanionId: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Column({ type: 'jsonb', nullable: true })
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Exclude()
  @Column({ type: 'jsonb' })
  privateExternalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  @Column({ type: 'integer', nullable: true })
  lastMessageId: number;

  @ApiPropertyOptional({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'firstCompanionId' })
  firstCompanion: User;

  @ApiPropertyOptional({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'secondCompanionId' })
  secondCompanion: User;

  @OneToMany(
    () => Message,
    message => message.chat,
  )
  messages: Message[];

  @ApiPropertyOptional({ type: () => Message })
  @OneToOne(() => Message)
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage: Message;

  constructor(data: DeepPartial<Chat>) {
    Object.assign(this, data);
  }
}
