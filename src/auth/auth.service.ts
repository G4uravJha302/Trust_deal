import { BadRequestException, 
  Body, 
  ForbiddenException, 
  HttpException, 
  Injectable, 
  UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {MailerService} from '../comman/utils/mail/otp.service';
import { UserRegisterDTO } from './Dto/register.dto';
import { compare, hash } from 'bcrypt';
import { LoginUserDTO } from './Dto/login.dto';
import { OtpVerifyDTO } from './Dto/otpVerify.dto';
import { User} from '../Entity/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockService } from '../utils/block.service';
import e from 'express';

@Injectable()
export class AuthService {

   constructor(
    @InjectRepository(User) private userModel: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}
  async register(user: UserRegisterDTO): Promise<{ token: string; newUser: User }> {
    const exitingUser = await this.userModel.findOne({ where: { username: user.username } });
    if (exitingUser) {
      throw new BadRequestException('User is already exists');
    }

    const exitingEmail = await this.userModel.findOne({ where: { email: user.email } });
    if (exitingEmail) {
      throw new BadRequestException('Email is already exists');
    }      
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    const isMailSent = await this.mailerService.sendOtpEmail(user.email, otp)  ;
    // console.log("otp is:",otp);
    if (!isMailSent) {
      throw new BadRequestException('OTP not sent');
    }
    try {
      const hashedPassword = await hash(user.password, 10);
      const otpExpire = Date.now() + 10 * 60 * 1000;


    const newUser = this.userModel.create({
      ...user,
      password: hashedPassword,
      otp,
      otpExpire,
    });

    await this.userModel.save(newUser);
      const token = await this.jwtService.signAsync({
        userId: newUser.id,
        username: newUser.username,
      });

      return { token, newUser };
    } catch (error) {
      console.error('Error while registering user:', error);
      throw new BadRequestException('Error while registering user');
    }
  }

async login(user: LoginUserDTO) {
    try {
      const existingUser = await this.userModel.findOne({ where: { username: user.username } });
      
      if (!existingUser) {
        throw new BadRequestException('User is not exit');
      }

      const isValidPassword = await compare(user.password, existingUser.password);
      
      if (!isValidPassword) {
        throw new UnauthorizedException('Wrong Password');
      }
      if (
       existingUser.blockedUntil &&
        existingUser.blockedUntil > Date.now()
      ) {
    throw new ForbiddenException(
      'Account temporarily blocked. Try again later.'
    );

}
      const payload = {
        userId: existingUser.id,
        username: existingUser.username,
      };
      const token = await this.jwtService.signAsync(payload);
      return { existingUser, token };
      } 
      catch (error) {
        if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error while login user:', error);
      throw new BadRequestException('Error while login user');
    }
  }

async otpVerify(userData: OtpVerifyDTO) {
  try {
    const { otp, username } = userData;

 
    const existingUser = await this.userModel.findOne({ 
      where: { username } 
    });

    if (!existingUser) {
      throw new BadRequestException('User does not exist. Please check username');
    }

    if (existingUser.isVerify) {
      throw new BadRequestException('User is already verified');
    }

    if (!existingUser.otp) {
      throw new BadRequestException('No OTP found. Please request a new OTP');
    }

    if (existingUser.otpExpire && existingUser.otpExpire < Date.now()) {
      existingUser.otp = null;
      existingUser.otpExpire = null;
      existingUser.otpAttempts = 0;
      await this.userModel.save(existingUser);
      
      throw new BadRequestException('OTP has expired. Please request a new OTP');
    }

    if (existingUser.otpAttempts >= 5) {
      // Clear OTP after max attempts
      existingUser.otp = null;
      existingUser.otpExpire = null;
      existingUser.otpAttempts = 0;
      existingUser.isBlocked = true;
      existingUser.blockedUntil = Date.now() + 24 * 60 * 60 * 1000;
      await this.userModel.save(existingUser);
      
      throw new BadRequestException('You are blocked for 24 hours due to multiple wrong OTP attempts');
    }

    if (existingUser.otp !== otp) {
      existingUser.otpAttempts += 1;
      await this.userModel.save(existingUser);
      
      const remainingAttempts = 5 - existingUser.otpAttempts;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining`
      );
    }

    existingUser.isVerify = true;
    existingUser.otp = null;
    existingUser.otpExpire = null; 
    existingUser.otpAttempts = 0;
    existingUser.isBlocked = false;
    
    await this.userModel.save(existingUser);

    return {
      success: true,
      message: 'OTP verified successfully. Your account is now active',
    };

  } catch (error) {
    //  Re-throw known HTTP exceptions
    if (error instanceof HttpException) {
      throw error;
    }
    
    //  Log unexpected errors
    console.error('Unexpected error while verifying OTP:', error);
    throw new BadRequestException('Error while verifying OTP. Please try again');
  }
}


async resendOtp(@Body() body: { username: string }) {
  const { username } = body;
  // console.log(username);
   
  const existingUser = await this.userModel.findOne({ 
    where: { username } 
  });
   
  console.log(existingUser);

  if (!existingUser) {
    throw new BadRequestException('User does not exist');
  }

  if (existingUser.isVerify) {
    throw new BadRequestException('User is already verified');
  }

        if (
        existingUser.isBlocked &&
        existingUser.blockedUntil > Date.now()
      ) {
        throw new BadRequestException(
          'OTP resend blocked for 24 hours'
        );
      }


  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; 

    const isMailSent = await this.mailerService.sendOtpEmail(existingUser.email, otp);
    console.log("otp is:",otp);

  if (!isMailSent) {
    throw new BadRequestException('Failed to send OTP. Please try again');
  }
    if (existingUser.otpAttempts >= 5) {
      existingUser.isBlocked = true;
      existingUser.blockedUntil = Date.now() + 24 * 60 * 60 * 1000;
      await this.userModel.save(existingUser);
    throw new BadRequestException('Too many wrong attempts');

  }
  existingUser.otp = otp;
  existingUser.otpExpire = otpExpire;
  existingUser.otpAttempts += 1; 
  await this.userModel.save(existingUser);

  console.log('New OTP:', otp); 

  return {
    success: true,
    message: 'New OTP sent successfully',
  };
}
}
