import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { PasswordHashEngine } from '../../shared/hash.service';
import { TwilioService } from '../twilio/twilio.service';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private twilioService: TwilioService,
  ) {}

  async validateUser(credentials: { username: string; password: string }) {
    try {
      const user = await this.usersService.searchUserForAuth(
        credentials.username,
      );
      // && user.isActive && user.isApproved
      if (user) {
        const isPwdMatch = await PasswordHashEngine.check(
          credentials.password,
          user.password,
        );

        if (!isPwdMatch) {
          throw new HttpException(
            'Password mismatch error.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        return user;
      } else {
        throw new HttpException('Email not verified.', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw error;
    }
  }

  async sendOtp(to:string) {
    return await this.twilioService.sendCodeToUser(to);
  }

  async verifyOtp(to: string, code: string) {
    const verification = await this.twilioService.verifyUserCode(to, code);
    if (!verification || verification.status != 'approved') {
      throw new UnauthorizedException('OTP Verification Failed');
    }
    return true;
  }

  async login(user: UserEntity) {
    try {
      const payload = { username: user.username, sub: user.id };

      return { accessToken: this.jwtService.sign(payload) };
    } catch (error) {
      throw error;
    }
  }
}
