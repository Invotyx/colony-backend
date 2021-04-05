import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { UserEntity } from '../../entities/user.entity';
import { AuthMailer } from '../../mails/users/auth.mailer';
import { AuthService } from './auth.service';
import { PasswordHashEngine } from '../../shared/hash.service';
import { AppLogger } from '../../services/logs/log.service';
import { UsersService } from '../users/services/users.service';
import { UpdateProfileDto } from '../users/users.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ROLES } from 'src/services/access-control/consts/roles.const';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authMailer: AuthMailer,
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
    private readonly userService: UsersService,
  ) {
    this.logger.setContext('AuthController');
  }

  
  @Get('verify/:token')
  async verifyEmail(@Param('token') token: any) {
    try {
      const isEmailVerified = await this.userService.verifyEmail(token);
      if (isEmailVerified) {
        
        return { message: "Email verified", accessToken: (await this.authService.login(isEmailVerified)).accessToken };
      }
      else throw new BadRequestException('LOGIN_EMAIL_NOT_VERIFIED');
    } catch (error) {
      throw error;
    }
  }

  @ApiBody({ required: true })
  @Post('login')
  async login(@Request() req: any) {
    try {
      return this.authService.login(
        await this.authService.validateUser(req.body),
      );
    } catch (e) {
      throw new HttpException(e, HttpStatus.FORBIDDEN);
    }
  }

  @Auth({})
  @Get('profile')
  async getProfile(@LoginUser() user: UserEntity) {
    const allData = await this.userService.findOne(user.id);
    allData.password = '';
    return { data: allData };
  }

  @Post('user-tfa')
  async userTFA(@Body() data: any) {
    const user = await this.userService.isTFARequire(data.username);
    return user;
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post('updateUserProfile')
  @UsePipes(ValidationPipe)
  async updateUserProfile(
    @Body() user: UpdateProfileDto,
    @LoginUser() _user:UserEntity,
  ) {
    try {
      const allData = await this.userService.repository.findOne({
        where: { id: _user.id },
      });
      const oldPassword = await PasswordHashEngine.check(
        user.oldPassword,
        allData.password,
      );
      if (oldPassword) {
        const updateUser = await this.userService.updateUser( _user.id, user);
        return { data: updateUser };
      } else {
        throw new BadRequestException('please check the old password!!!');
      }
    } catch (error) {
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post('updateProfile')
  @UsePipes(ValidationPipe)
  async updateProfile(@Body() user: UpdateProfileDto,@LoginUser() _user:UserEntity,) {
    try {
      const updateUser = await this.userService.updateUser(_user.id, user);
      return { data: updateUser };
    } catch (error) {
      throw error;
    }
  }
}
