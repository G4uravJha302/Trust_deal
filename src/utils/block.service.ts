// block.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { User } from '../Entity/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlockService {
  async check(user: User, userRepo?: Repository<User>) {
    
    if (user.blockedUntil && user.blockedUntil > Date.now()) {
      throw new ForbiddenException(
        'Account temporarily blocked. Try again later.'
      );
    }

    
    if (user.blockedUntil && user.blockedUntil <= Date.now()) {
      user.blockedUntil = null;
      user.otpAttempts = 0;

      if (userRepo) {
        await userRepo.save(user);
      }
    }
  }
}
