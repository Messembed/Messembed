import {
  Entity,
  Column,
  DeepPartial,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'users',
})
export class User {
  @ApiProperty()
  @PrimaryColumn({ type: 'varchar', length: 128 })
  id: string;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @CreateDateColumn({ type: 'timestamptz', default: 'NOW()' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @UpdateDateColumn({ type: 'timestamptz', default: 'NOW()' })
  updatedAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

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
