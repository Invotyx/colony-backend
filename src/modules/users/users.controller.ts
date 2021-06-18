import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { EmailTokenSender } from '../../mails/users/emailtoken.mailer';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { CompressJSON } from '../../services/common/compression/compression.interceptor';
import { PasswordHashEngine } from '../../shared/hash.service';
import { PaginatorError, PaginatorErrorHandler } from '../../shared/paginator';
import { inValidDataRes } from '../../shared/res.fun';
import { UserEntity } from './entities/user.entity';
import { InValidDataError, UserNotExistError } from './errors/users.error';
import { editFileName, imageFileFilter } from './imageupload.service';
import { RolesService } from './services/roles.service';
import { UsersService } from './services/users.service';
import { PasswordChange, UpdateProfileDto, UpdateRole } from './users.dto';

// const idToPath = (x, data) => {
//   return `APP/${data.orgId}/${TABLES.USERS.id}/${data.id}/${path}`;
// };
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly emailTokenSend: EmailTokenSender,
    private readonly rolesService: RolesService,
  ) {}

  @Auth({ roles: [ROLES.ADMIN] })
  @Get('')
  @CompressJSON()
  async getAllUsers(@Body('jData') data: any) {
    return this.userService.getAllUsers(data);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(@LoginUser() user: UserEntity): Promise<UserEntity> {
    return this.userService.findOne({
      where: { id: user.id },
      relations: ['paymentMethod'],
    });
  }

  @Get('resend-verification/:email')
  async sendEmailVerification(@Param() params: any) {
    try {
      await this.userService.createEmailToken(params.email);

      const isEmailSent = await this.emailTokenSend.sendEmailVerification(
        params.email,
      );
      if (isEmailSent) {
        return { message: 'EMAIL_SENT' };
      } else {
        throw new BadRequestException('MAIL_NOT_SENT');
      }
    } catch (error) {
      throw error;
    }
  }

  @Get('forgot-password/:email')
  async sendPasswordResetToken(@Param() params: any) {
    try {
      const isEmailSent = await this.userService.sendResetPasswordVerification(
        params.email,
      );

      if (isEmailSent) {
        return { message: 'Email sent' };
      } else {
        console.error('Mail server down, try again later!');
        throw new BadRequestException('Mail server down, try again later!');
      }
    } catch (error) {
      throw error;
    }
  }

  @Get('verify-forgot-password')
  async verfiyResetPasswordToken(@Query() param: any) {
    try {
      const isEmailVerified = await this.userService.verifyResetPasswordToken(
        param.token,
        param.email,
      );
      if (isEmailVerified) return isEmailVerified;
      else throw new BadRequestException('PASSWORD_NOT_VERIFIED');
    } catch (error) {
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Get(':id')
  async getUser(@Param('id') id: number) {
    try {
      const user = await this.userService.findOne({ where: { id: id } });
      return { data: user };
    } catch (error) {
      if (error instanceof PaginatorError) {
        throw PaginatorErrorHandler(error);
      }
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post('roles')
  getRoles() {
    const res = this.rolesService.findAll();
    return res;
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Get(':id/roleId')
  getRolesId(@Param('id') id: string) {
    return this.userService.findOne({
      where: { id: id },
      relations: ['roles'],
    });
    //return this.rolesService.repository.find();
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post(':id/update')
  @UsePipes(ValidationPipe)
  async updateUser(@Body() user: UpdateProfileDto, @Param('id') id: string) {
    try {
      if (user.username == 'admin') {
        throw new BadRequestException('You cannot change username to admin');
      }
      const updateUser = await this.userService.updateUser(id, user);

      return { updateUser };
    } catch (error) {
      if (error instanceof InValidDataError) {
        throw new BadRequestException(inValidDataRes([error.message]));
      }
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post(':id/updateRole')
  @UsePipes(ValidationPipe)
  async updateRole(@Body() user: UpdateRole, @Param('id') id: string) {
    try {
      const updateUser = await this.userService.updateRoles(id, user);
      return { data: updateUser };
    } catch (error) {
      if (error instanceof InValidDataError) {
        throw new BadRequestException(inValidDataRes([error.message]));
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update-password')
  @UsePipes(ValidationPipe)
  async updatePwd(@Body() data: PasswordChange) {
    try {
      const user = await this.userService.findOne({
        where: { email: data.email },
      });
      if (!user) {
        throw new BadRequestException(UserNotExistError);
      }
      user.password = await PasswordHashEngine.make(data.password);

      await this.userService.save(user);
      return { message: 'Password updated successfully.' };
    } catch (error) {
      if (error instanceof InValidDataError) {
        throw new BadRequestException(inValidDataRes([error.message]));
      }
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post('upProfileImage')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFile(@UploadedFile() image: any, @LoginUser() _user: UserEntity) {
    // console.log(pic);
    const user = await this.userService.findOne(_user.id);

    //upload pic
    return this.userService.setProfileImage(user, image);
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    try {
      const _u = await this.userService.findOne({
        where: { username: username },
        relations: ['numbers'],
      });
      if (_u) {
        const user = {
          username: _u.username,
          dob: _u.dob,
          link: _u.links,
          image: _u.image,
          status: _u.statusMessage,
          numbers: _u.numbers,
        };
        return { user };
      }
      throw new BadRequestException('Influencer not found in our system');
    } catch (e) {
      throw e;
    }
  }
}
