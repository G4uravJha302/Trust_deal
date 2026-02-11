import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './User.entity';
import { Profile } from './profile.entity';

@Module({
imports: [
    TypeOrmModule.forFeature([
      User,Profile
  ]),
],
exports: [TypeOrmModule]

})
export class ModelModule {}

