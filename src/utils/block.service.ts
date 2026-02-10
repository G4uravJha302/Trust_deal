// block.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { User } from '../Entity/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

@Injectable()
@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async check(user: User): Promise<void> {
    const now = new Date();
    
    if (user.blockedUntil && user.blockedUntil > now.getTime()) {
      throw new ForbiddenException('Account temporarily blocked');
    }
    if (user.blockedUntil && user.blockedUntil <= now.getTime()) {
      await this.unblockUser(user);
    }
  }

  private async unblockUser(user: User): Promise<void> {
    user.blockedUntil = null;
    user.otpAttempts = 0;
    await this.userRepo.save(user);
  }
}
