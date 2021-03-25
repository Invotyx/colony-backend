import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Res,
  HttpStatus,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { TABLES } from '../../consts/tables.const';
import { Auth } from '../../decorators/auth.decorator';
import { PasswordHashEngine } from '../../shared/hash.service';
import { CompressJSON } from '../../services/common/compression/compression.interceptor';
import { RolesService } from './services/roles.service';
import { InValidDataError, UserNotExistError } from './errors/users.error';
import { UsersService } from './services/users.service';
import {
  columnListToSelect,
  dataViewer,
  mapColumns,
  paginateQuery,
  PaginatorError,
  PaginatorErrorHandler,
} from '../../shared/paginator';
import { inValidDataRes } from '../../shared/res.fun';
import {
  CreateUserDto,
  PasswordChange,
  UpdateProfileDto,
  UpdateRole,
} from './users.dto';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/entities/user.entity';
import { EmailTokenSender } from 'src/mails/users/emailtoken.mailer';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from './imageupload.service';
import { LoginUser } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';

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
  async getAllUsers(@Body('jData') data: any, @Res() res: Response) {
    try {
      const userTable = TABLES.USERS.name;
      const columnList: any = {
        id: { table: userTable, column: 'id' },
        firstName: { table: userTable, column: 'firstName' },
        lastName: { table: userTable, column: 'lastName' },
        username: { table: userTable, column: 'username' },
        email: { table: userTable, column: 'email' },
        createdAt: { table: userTable, column: 'createdAt' },
        gender: { table: userTable, column: 'gender' },
        mobile: { table: userTable, column: 'mobile' },
        //password: { table: userTable, column: 'password' },
        image: { table: userTable, column: 'image' },
        isActive: {
          table: userTable,
          column: 'isActive',
          valueMapper: (v: any) => (v ? 'YES' : 'NO'),
        },
      };
      const sortList = {
        firstName: { table: userTable, column: 'firstName' },
      };
      const filterList = {
        firstName: { table: userTable, column: 'firstName' },
        isActive: {
          table: userTable,
          column: 'isActive',
          valueMapper: (v: any) => Number(v === 'YES'),
        },
      };
      const { filters, configs } = dataViewer({
        data,
        filterList,
        sortList,
        columnList,
      });
      const query = await this.userService.repository
        .createQueryBuilder(TABLES.USERS.name)
        .select(columnListToSelect(columnList))
        .where(filters.sql);

      const paginatedData = await paginateQuery(query, configs, userTable);
      if (paginatedData.data.length) {
        paginatedData.data = paginatedData.data.map(
          mapColumns(paginatedData.data[0], columnList),
        );
      }
      return { data: paginatedData.data, meta: paginatedData.meta };
    } catch (error) {
      if (error instanceof PaginatorError) {
        throw PaginatorErrorHandler(error);
      }
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(@LoginUser() user: UserEntity): Promise<UserEntity> {
    return await this.userService.repository.findOne({
      where: { id: user.id },
    });
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: any, @Res() res: Response) {
    try {
      const isEmailVerified = await this.userService.verifyEmail(token);
      if (isEmailVerified) return isEmailVerified;
      else throw new BadRequestException('LOGIN_EMAIL_NOT_VERIFIED');
    } catch (error) {
      throw error;
    }
  }

  @Get('resend-verification/:email')
  async sendEmailVerification(@Param() params: any, @Res() res: Response) {
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
  async sendPasswordResetToken(@Param() params: any, @Res() res: Response) {
    try {
      const isEmailSent = await this.userService.sendResetPasswordVerification(
        params.email,
      );

      if (isEmailSent) {
        return { message:'Email sent' };
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
      if (isEmailVerified)
        return isEmailVerified;
      else throw new BadRequestException('PASSWORD_NOT_VERIFIED');
    } catch (error) {
      throw error;
    }
  }
  //@Auth({ roles: [ROLES.ADMIN] })
  @Get(':id')
  async getUser(@Param('id') id: number) {
    try {
      const user = await this.userService.repository.findOne(id);
      return { data: user };
    } catch (error) {
      if (error instanceof PaginatorError) {
        throw PaginatorErrorHandler(error);
      }
      throw (error);
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
    return this.userService.repository.findOne(id, { relations: ['roles'] });
    //return this.rolesService.repository.find();
  }

  // @Auth({})
  @Post()
  @UsePipes(ValidationPipe)
  async createUser(@Body() user: CreateUserDto) {
    try {
      if (user.username == 'admin') {
        throw new BadRequestException('You cannot create user with username admin');
      }
      const newUser = await this.userService.createUser(user);
      return { data: newUser };
    } catch (error) {
      
      throw (error.message);
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post(':id/update')
  @UsePipes(ValidationPipe)
  async updateUser(
    @Body() user: UpdateProfileDto,
    @Param('id') id: string
  ) {
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
      throw (error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/updateRole')
  @UsePipes(ValidationPipe)
  async updateRole(
    @Body() user: UpdateRole,
    @Param('id') id: string,
  ) {
    try {
      const updateUser = await this.userService.updateRoles(id, user);
      return { data: updateUser };
    } catch (error) {
      if (error instanceof InValidDataError) {
        throw new BadRequestException(inValidDataRes([error.message]));
      }
      throw error.message;
    }
  }

  @Post('update-password')
  @UsePipes(ValidationPipe)
  async updatePwd(@Body() data: PasswordChange, @Res() res: Response) {
    try {
      const user = await this.userService.repository.findOne({
        where: { email: data.email },
      });
      if (!user) {
        throw new BadRequestException(UserNotExistError);
      }
      user.password = await PasswordHashEngine.make(data.password);

      await this.userService.repository.save(user);
      return { message: 'Password updated successfully.' };
    } catch (error) {
      if (error instanceof InValidDataError) {
        throw new BadRequestException(inValidDataRes([error.message]));
      }
      throw error;
    }
  }

  // @Auth({})
  @Post(':id/upProfileImage')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() image: any,
    @Param('id') id: number /* ,@LoginUser() user: UserEntity */,
  ) {
    // console.log(pic);
    const user = await this.userService.findOne(id);

    //upload pic
    return this.userService.setProfileImage(user, image);
  }

  @Get(':id')
  async getSingleUser(@Param('id') id: number) {
    const allData = await this.userService.findOne(id);
    return { user: allData };
  }
}
