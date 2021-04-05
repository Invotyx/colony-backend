import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from '../../consts/jwt.const';
import { AuthMailer } from '../../mails/users/auth.mailer';
import { AuthController } from './auth.controller';
import { AppLogger } from '../../services/logs/log.service';
import { MailModule } from '../../services/mail/mail.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: 60 * 60 },
    }),
  ],
  providers: [AppLogger, AuthService, LocalStrategy, JwtStrategy, AuthMailer],
  exports: [AuthService, UsersModule],
})
export class AuthModule {}
