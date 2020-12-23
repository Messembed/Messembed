import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './repositories/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongo, UserMongoSchema } from './schemas/user.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository]),
    MongooseModule.forFeature([
      { name: UserMongo.name, schema: UserMongoSchema },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
