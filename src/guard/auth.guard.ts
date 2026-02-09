import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Cookies mein se 'access_token' nikalna
    const token = request.cookies['token']; 
    console.log('Token:', token);
    if (!token) {
      throw new UnauthorizedException('Session expired. Please login again.');
    }

    try {
      // Token ko verify karna
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // User data ko request object mein save karna taaki Controller use kar sake
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid Token');
    }

    return true;
  }
}