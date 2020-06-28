import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeepPartial,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'users',
})
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @CreateDateColumn({ type: 'timestamptz', default: 'NOW()' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @UpdateDateColumn({ type: 'timestamptz', default: 'NOW()' })
  updatedAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ApiProperty()
  @Column({ type: 'varchar' })
  externalId: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Column({ type: 'jsonb' })
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Exclude()
  @Column({ type: 'jsonb' })
  privateExternalMetadata?: Record<string, unknown> | null;

  constructor(fields: DeepPartial<User>) {
    Object.assign(this, fields);
  }
}
