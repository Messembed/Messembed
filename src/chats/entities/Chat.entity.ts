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
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/User.entity';

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
  initiatorId: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false })
  companionId: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Column({ type: 'jsonb', nullable: true })
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @ApiPropertyOptional({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion: User;

  constructor(data: DeepPartial<Chat>) {
    Object.assign(this, data);
  }
}
