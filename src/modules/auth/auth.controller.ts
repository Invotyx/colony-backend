import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  Res,
  UnprocessableEntityException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ROLES } from "src/services/access-control/consts/roles.const";
import { logger } from "src/services/logs/log.storage";
import { error } from "src/shared/error.dto";
import { uniqueId } from "src/shared/random-keygen";
import { Auth } from "../../decorators/auth.decorator";
import { LoginUser } from "../../decorators/user.decorator";
import { AuthMailer } from "../../mails/users/auth.mailer";
import { AppLogger } from "../../services/logs/log.service";
import { UserEntity } from "../users/entities/user.entity";
import { UsersService } from "../users/services/users.service";
import {
  CreateUserDto,
  UpdateProfileDto,
  UpdateProfilePasswordDto,
} from "../users/users.dto";
import { AuthService } from "./auth.service";

export class VerifyOTPDto {
  @IsString()
  sessionId: string;

  @IsString()
  code: string;
}

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    private readonly authMailer: AuthMailer,
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
    private readonly userService: UsersService,
  ) {
    this.logger.setContext("AuthController");
  }

  @Get("verify/:token")
  async verifyEmail(@Param("token") token: any) {
    try {
      const isEmailVerified = await this.userService.verifyEmail(token);
      if (isEmailVerified) {
        return {
          message: "Email verified",
          accessToken: (await this.authService.login(isEmailVerified))
            .accessToken,
        };
      } else throw new BadRequestException("LOGIN_EMAIL_NOT_VERIFIED");
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  @ApiBody({ required: true })
  @Post("verify2fa")
  async verify2fa(@Request() req: any) {
    const validate = await this.authService.validateUser(req.body);
    const check = await this.authService.verifyOtp(
      validate.mobile,
      req.body.code,
    );
    if (check) {
      return this.authService.login(validate);
    }
    throw new BadRequestException("Invalid 2fa code");
  }

  @ApiBody({ required: true })
  @Post("send2fa")
  async send2fa(@Body("mobile") mobile: string) {
    try {
      mobile = mobile
        .replace(" ", "")
        .replace("(", "")
        .replace(")", "")
        .replace("-", "");
      await this.authService.sendOtp(mobile);
    } catch (ex) {
      throw new HttpException(
        "Contact system admin. Unable to send OTP.",
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    return { message: " 2fa code sent to number." };
  }

  @ApiBody({ required: true })
  @Post("login")
  async login(@Request() req: any, @Res({ passthrough: true }) res: any) {
    const validate = await this.authService.validateUser(req.body);
    try {
      if (validate.require2fa) {
        res.status(HttpStatus.ACCEPTED);
        console.log(validate);
        await this.authService.sendOtp(validate.mobile);
        return {
          success: true,
          message: "Please verify your phone number to continue",
          sessionId: uniqueId(10),
        };
      }

      return this.authService.login(validate);
    } catch (e) {
      throw new HttpException(e, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  @Get("verify-forgot-password")
  async verfiyResetPasswordToken(@Query() param: any) {
    try {
      const isEmailVerified = await this.userService.verifyResetPasswordToken(
        param.token,
        param.email,
      );

      if (isEmailVerified)
        return {
          accessToken: (await this.authService.login(isEmailVerified))
            .accessToken,
        };
      else throw new BadRequestException("PASSWORD_NOT_VERIFIED");
    } catch (error) {
      throw error;
    }
  }

  @Auth({})
  @Get("profile")
  async getProfile(@LoginUser() user: UserEntity) {
    const allData = await this.userService.findOne(user.id);
    allData.password = "";
    return { data: allData };
  }

  @Post("user-tfa")
  async userTFA(@Body() data: any) {
    const user = await this.userService.isTFARequire(data.username);
    return user;
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post("updateUserProfile")
  @UsePipes(ValidationPipe)
  async updateUserProfile(
    @Body() user: UpdateProfileDto,
    @LoginUser() _user: UserEntity,
  ) {
    try {
      const updateUser = await this.userService.updateUser(_user.id, user);
      return { data: updateUser.message };
    } catch (error) {
      throw error;
    }
  }
  // @Auth({})
  @Post("register")
  @UsePipes(ValidationPipe)
  async createUser(@Body() user: CreateUserDto) {
    try {
      if (user.username == "admin") {
        throw new BadRequestException(
          "You cannot create user with username admin",
        );
      }
      if (
        !user.mobile ||
        !user.email ||
        !user.firstName ||
        !user.lastName ||
        !user.password ||
        !user.username
      ) {
        throw new BadRequestException(
          "One of mandatory fields(firstName,lastName,username,email,password,mobile) missing.",
        );
      }
      if (user.username.includes(" ")) {
        throw new UnprocessableEntityException(
          error(
            [
              {
                key: "username",
                reason: "invalidData",
                description: "Username contains space character",
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Unprocessable entity",
          ),
        );
      }
      user.mobile = user.mobile
        .replace(" ", "")
        .replace("(", "")
        .replace(")", "")
        .replace("-", "");
      try {
        await this.authService.verifyOtp(user.mobile, user.otp);
      } catch (ex) {
        throw new HttpException(
          "Contact system admin. Unable to verify OTP.",
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
      const newUser = await this.userService.createUser(user);
      return {
        data: newUser,
        accessToken: (await this.authService.login(newUser.user)).accessToken,
      };
    } catch (error) {
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post("updateProfile")
  @UsePipes(ValidationPipe)
  async updateProfile(
    @Body() user: UpdateProfileDto,
    @LoginUser() _user: UserEntity,
  ) {
    try {
      const updateUser = await this.userService.updateUser(_user.id, user);
      return { data: updateUser };
    } catch (error) {
      throw error;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post("updatePassword")
  @UsePipes(ValidationPipe)
  async updatePassword(
    @Body() data: UpdateProfilePasswordDto,
    @LoginUser() _user: UserEntity,
  ) {
    try {
      const updateUser = await this.userService.updatePassword(_user.id, data);
      return { data: updateUser.message };
    } catch (error) {
      throw error;
    }
  }
}
