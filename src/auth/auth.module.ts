import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ModelModule } from '../Entity/Entity.module';
import { MailerModule } from '../comman/utils/mail/otp.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityModule } from '../utils/security.module';


@Module({
  imports: [ModelModule,
    MailerModule,
    SecurityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'root_trust_deal',
        signOptions: { expiresIn: '15d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
