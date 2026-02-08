import { BadRequestException, 
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
      const exitingUser = await this.userModel.findOne({ where: { username: user.username } });
      
      if (!exitingUser) {
        throw new BadRequestException('User is not exit');
      }

      const isValidPassword = await compare(user.password, exitingUser.password);
      
      if (!isValidPassword) {
        throw new UnauthorizedException('Wrong Password');
      }

      const payload = {
        userId: exitingUser.id,
        username: exitingUser.username,
      };
      const token = await this.jwtService.signAsync(payload);
      return { exitingUser, token };
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

    //  User  find 
    const existingUser = await this.userModel.findOne({ 
      where: { username } 
    });

    if (!existingUser) {
      throw new BadRequestException('User does not exist. Please check username');
    }

    //  Check if user is already verified
    if (existingUser.isVerify) {
      throw new BadRequestException('User is already verified');
    }

    //  Check if OTP exists
    if (!existingUser.otp) {
      throw new BadRequestException('No OTP found. Please request a new OTP');
    }

    //  Check OTP expiry FIRST (before checking attempts)
    if (existingUser.otpExpire && existingUser.otpExpire < Date.now()) {
      // Reset OTP data
      existingUser.otp = null;
      existingUser.otpExpire = null;
      existingUser.otpAttempts = 0;
      await this.userModel.save(existingUser);
      
      throw new BadRequestException('OTP has expired. Please request a new OTP');
    }

    //  Check max attempts (5 attempts allowed)
    if (existingUser.otpAttempts >= 5) {
      // Clear OTP after max attempts
      existingUser.otp = null;
      existingUser.otpExpire = null;
      existingUser.otpAttempts = 0;
      await this.userModel.save(existingUser);
      
      throw new BadRequestException('Maximum OTP attempts exceeded. Please request a new OTP');
    }

    //  Verify OTP
    if (existingUser.otp !== otp) {
      // Increment attempt counter
      existingUser.otpAttempts += 1;
      await this.userModel.save(existingUser);
      
      const remainingAttempts = 5 - existingUser.otpAttempts;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining`
      );
    }

    //  OTP verified successfully - Update user
    existingUser.isVerify = true;
    existingUser.otp = null;
    existingUser.otpExpire = null;
    existingUser.otpAttempts = 0; // Reset attempts
    
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

async resendOtp(username: string) {
  const existingUser = await this.userModel.findOne({ 
    where: { username } 
  });

  if (!existingUser) {
    throw new BadRequestException('User does not exist');
  }

  if (existingUser.isVerify) {
    throw new BadRequestException('User is already verified');
  }

  // ✅ Generate new OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Send email
    const isMailSent = await MailerService.prototype.sendOtpEmail(existingUser.email, otp);
    console.log("otp is:",otp);

  if (!isMailSent) {
    throw new BadRequestException('Failed to send OTP. Please try again');
  }

  // ✅ Update user with new OTP and reset attempts
  existingUser.otp = otp;
  existingUser.otpExpire = otpExpire;
  existingUser.otpAttempts = 0; // Reset attempts
  await this.userModel.save(existingUser);

  console.log('New OTP:', otp); // Development only - remove in production

  return {
    success: true,
    message: 'New OTP sent successfully',
  };
}

}