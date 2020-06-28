import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeepPartial,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/User.entity';
import { Chat } from '../../chats/entities/Chat.entity';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'messages',
})
export class Message {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: 'string', format: 'ISO 8601' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8601' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'ISO 8601' })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ApiPropertyOptional({ type: 'string', format: 'ISO 8601' })
  @Column({ type: 'timestamptz', nullable: true })
  editedAt?: Date | null;

  @ApiProperty()
  @Column({ type: 'integer' })
  chatId: number;

  @ApiProperty()
  @Column({ type: 'integer' })
  userId: number;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: false, default: false })
  read: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Column({ type: 'jsonb' })
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Exclude()
  @Column({ type: 'jsonb' })
  privateExternalMetadata?: Record<string, unknown> | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  constructor(fields?: DeepPartial<Message>) {
    Object.assign(this, fields);
  }
}
