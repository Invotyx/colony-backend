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
import { exception } from 'console';
import { Http2ServerResponse } from 'http2';
import * as moment from 'moment';
import { ExceptionHandler } from 'winston';
import { TABLES } from '../../consts/tables.const';
import { Auth, Authenticate } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { TokenEntity } from '../../entities/token.entity';
import { UserEntity } from '../../entities/user.entity';
import { AuthMailer } from '../../mails/users/auth.mailer';
import { AuthService } from './auth.service';
import { PasswordHashEngine } from './hash.service';
import { FileMgrService } from '../../services/file-mgr/file-mgr.service';
import { AppLogger } from '../../services/logs/log.service';
import { UsersService } from '../users/services/users.service';
import { PasswordRestChange } from '../token/token.dto';
import { TokenService } from '../token/token.service';
import { UpdateProfileDto } from '../users/users.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authMailer: AuthMailer,
    private readonly authService: AuthService,
    private readonly fileMgrService: FileMgrService,
    private readonly logger: AppLogger,
    private readonly tokenService: TokenService,
    private readonly userService: UsersService
  ) {
    this.logger.setContext('AuthController');
  }

  @Post('login')
  async login(@Request() req) {
    try {      
      return this.authService.login(await this.authService.validateUser(req.body));
    } catch (e) {
      throw new HttpException(e,HttpStatus.FORBIDDEN);
    }
    
  }

  @Auth({})
  @Get('profile')
  async getProfile(@LoginUser() user: UserEntity) {
    let imageUrl;
    const thumb = await this.fileMgrService.findUser(user.id);
    if (thumb) {
      const path = thumb.path;
      imageUrl = this.fileMgrService.genFileUrl({
        moduleId: TABLES.USERS.id,
        itemId: user.id,
        path,
      });
    }
    console.log(imageUrl);
    const allData = await this.userService.findOne(user.id);
    const c = await PasswordHashEngine.make(allData.password);
    console.log(c);
    console.log(allData);
    allData.pic = imageUrl as any;
    return { data: allData };
  }

  @Post('forgetPassword')
  async forgetPassword(@Body() data) {
    const email: string = data.email;
    const user = await this.userService.findUserByEmail(email);
    if (user){
      const token = 1e7 + Math.floor(Math.random() * 9e7);
      this.logger.debug(`new token (${token}) is generated`);
      const existingToken = await this.tokenService.findToken(user.id);
      if (existingToken) {
        this.logger.verbose(`Token already existing`);
        await this.tokenService.repository.update(user.id, { token });
        this.logger.log(`Token sent to user [${user.id}]`);
        return this.authMailer.setForgetPasswordMail(user, token);
      } else {
        this.logger.verbose(`Creating new token`);
        const newToken = new TokenEntity();
        newToken.token = token;
        newToken.userId = user.id;
        await this.tokenService.createToken(newToken);
        this.logger.log(`Token sent to user [${user.id}]`);
        return this.authMailer.setForgetPasswordMail(user, token);
      }
    }
  }

  @Post('user-tfa')
  async userTFA(@Body() data) {
    const user = await this.userService.isTFARequire(data.username);
    return user;
  }

  @Post('reset')
  @UsePipes(ValidationPipe)
  async updateUser(@Body() token: PasswordRestChange) {
    const user = await this.userService.findUserByEmail(token.email);
    const userToken = await this.tokenService.findToken(user.id);
    try {
      if (
        userToken.token === token.token &&
        moment().isBefore(moment(userToken.updatedAt).add(10, 'm'))
      ) {
        const password = await PasswordHashEngine.make(token.password);
        const updateUser = await this.userService.repository.update(user.id,{});
        return { data: updateUser };
      } else {
        throw new BadRequestException('Invalid Token or Token Time Expired');
      }
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/updateUserProfile')
  @UsePipes(ValidationPipe)
  async updateUserProfile(
    @Body() user: UpdateProfileDto,
    @Param('id') id: number
  ) {
    try {
      const allData = await this.userService.findOne(id);
      const oldPassword = await PasswordHashEngine.check(
        user.oldPassword,
        allData.password
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
      const allData = await this.userService.findOne(id);
      console.log(allData);
      const updateUser = await this.userService.updateUser(id, user);
      return { data: updateUser };
    } catch (error) {
      throw error;
    }
  }
}
