import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { profileDTO } from './UserDTO/profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entity/User.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { BlockService } from '../utils/block.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class UserService {
    constructor(    
      @InjectRepository(User) private userModel: Repository<User>,
      private jwtService: JwtService,
      private blockService: BlockService
    ) {}
      async getProfile(token: string) {
          const userData = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
          });
          if (!userData) {
            throw new UnauthorizedException('Invalid token');
          }

          if (!token) throw new UnauthorizedException();

          const decoded = this.jwtService.decode(token);

          const user = await this.userModel.findOneBy({ id: decoded.userId });
         this.blockService.check(user);
          return user;
      } 

      async updateProfile(@Req() req, updateProfile: profileDTO) {
          const token = req.cookies['token'];
          if (!token) throw new UnauthorizedException();
          const userData = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
          });
          
          if (!userData) {
          throw new UnauthorizedException('Invalid token');
          }
          
        const decoded = this.jwtService.decode(token);
        const user = await this.userModel.findOneBy({ id: decoded.userId });

        if(!user){
          throw new DOMException('User Not Found.')
        }

    const isBlocked = this.blockService.check(user);
         if (isBlocked) {
          throw new UnauthorizedException('User is blocked from accessing the profile due to multiple failed OTP attempts.');
        }

        
    await this.userModel.update(decoded.userId, { ...updateProfile });
    return { id: decoded.userId, ...updateProfile };
  }



  deactivateAccount(userId: string) {
    return { message: `User with id ${userId} has been deactivated.` };
  }
  
}