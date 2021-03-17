import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../entities/user.entity';
import { UsersService } from '../users/services/users.service';
import { PasswordHashEngine } from '../../shared/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(credentials: { username: string; password: string }) {
    try {
      const user = await this.usersService.searchUserForAuth(
        credentials.username,
      );
      if (user && user.isActive && user.isApproved) {
        const isPwdMatch = await PasswordHashEngine.check(
          credentials.password,
          user.password,
        );

        if (!isPwdMatch) {
          throw new HttpException(
            'Password mismatch error.',
            HttpStatus.BAD_REQUEST,
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

  async login(user: UserEntity) {
    try {
      const payload = { username: user.username, sub: user.id };

      return { accessToken: this.jwtService.sign(payload) };
    } catch (error) {
      throw error;
    }
  }
}
