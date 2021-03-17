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
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

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

  @ApiBody({required:true})
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

  @Post(':id/updateUserProfile')
  @UsePipes(ValidationPipe)
  async updateUserProfile(
    @Body() user: UpdateProfileDto,
    @Param('id') id: number,
  ) {
    try {
      const allData = await this.userService.repository.findOne({
        where: { id: id },
      });
      const oldPassword = await PasswordHashEngine.check(
        user.oldPassword,
        allData.password,
      );
      if (oldPassword) {
        const updateUser = await this.userService.updateUser(id, user);
        return { data: updateUser };
      } else {
        throw new BadRequestException('please check the old password!!!');
      }
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/updateProfile')
  @UsePipes(ValidationPipe)
  async updateProfile(@Body() user: UpdateProfileDto, @Param('id') id: number) {
    try {
      const updateUser = await this.userService.updateUser(id, user);
      return { data: updateUser };
    } catch (error) {
      throw error;
    }
  }
}
