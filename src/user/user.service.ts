import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../Entity/User.entity';
import { Profile } from '../Entity/profile.entity';
import { BlockService } from '../utils/block.service';
import { UpdateProfileDto } from '../user/UserDTO/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private userRepo: Repository<User>,
    
    @InjectRepository(Profile) 
    private profileRepo: Repository<Profile>,
    
    private jwtService: JwtService,
    private blockService: BlockService
  ) {}

  private async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const userData = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return userData;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getProfile(token: string) {
    const userData = await this.verifyToken(token);
    console.log(userData);
    const user = await this.userRepo.findOne({
      where: { id: userData.userId},
      relations: ['profile'], 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if blocked
    await this.blockService.check(user);

    return user; // ClassSerializerInterceptor @Exclude fields remove kar dega
  }

  async updateProfile(token: string, updateProfileDto: UpdateProfileDto) {
    const userData = await this.verifyToken(token);

    const user = await this.userRepo.findOne({
      where: { id: userData.userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if blocked
    await this.blockService.check(user);

    // Create profile if doesn't exist
    if (!user.profile) {
      user.profile = this.profileRepo.create({});
    }

    // Update profile fields
    Object.assign(user.profile, updateProfileDto);

    // Save (cascade will save profile too)
    await this.userRepo.save(user);

    return {
      message: 'Profile updated successfully',
      user,
    };
  }

  async deactivateAccount(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Option 1: Soft delete
    user.isActive = false; // Add isActive column in entity
    await this.userRepo.save(user);

    // Option 2: Hard delete (uncomment if needed)
    // await this.userRepo.delete(userId);

    return { 
      message: `User with id ${userId} has been deactivated.` 
    };
  }
}