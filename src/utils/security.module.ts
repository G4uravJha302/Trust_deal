import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { UserModule } from '../user/user.module';
import { ModelModule } from '../Entity/Entity.module';

@Module({
  imports: [ModelModule],
  providers: [BlockService],
  exports: [BlockService], 
})
export class SecurityModule {}
