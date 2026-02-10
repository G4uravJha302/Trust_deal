import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { ModelModule } from '../Entity/Entity.module';
import { SecurityModule } from '../utils/security.module';

@Module({
  imports: [JwtModule, ModelModule, SecurityModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
