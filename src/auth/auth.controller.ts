import { Body,
   Controller, 
   ValidationPipe, 
   UsePipes, 
   Res, 
   UseGuards} from '@nestjs/common';
import express from 'express';
import { Post } from '@nestjs/common';
import { UserRegisterDTO } from './Dto/register.dto';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './Dto/login.dto';
import { OtpVerifyDTO } from './Dto/otpVerify.dto';
import { AuthGuard } from '../guard/auth.guard';
@Controller('')
export class AuthController {
 constructor(private authService: AuthService) {}
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() userData: UserRegisterDTO, @Res({ passthrough: true }) res: express.Response) {
    const { token, newUser } = await this.authService.register(userData);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return {
      message: 'User registered successfully',
      isLogin: true,
      token,
      user: {
        username: newUser.username,
      },
    };
  }

 @Post('Login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUser: LoginUserDTO, @Res({ passthrough: true }) res: express.Response) {
    const { existingUser, token } = await this.authService.login(loginUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return {
      message: 'User login successfully',
      isLogin: true,
      user: {
        _id: existingUser.id,
        username: existingUser.username,
      },
    };
  }

  @Post('resendOtp')
  @UsePipes(new ValidationPipe())
  async resendOtp(@Body() body: { username: string }) {
    const reqData = await this.authService.resendOtp(body);
    return reqData;
  }

  @Post('otpVerify')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async otpVerify(@Body() otpVerifyData: OtpVerifyDTO) {
    const reqData = await this.authService.otpVerify(otpVerifyData);
    return reqData;
  }

  @Post('LogOut')
  @UseGuards(AuthGuard)
  LogOut(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return { success: true, isLogOut: true, message: 'logout successfully' };
  }

}