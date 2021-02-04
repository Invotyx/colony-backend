import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { TABLES } from '../../../consts/tables.const';
import { UserEntity } from '../../../entities/user.entity';
import {
  CreateUserDto,
  UpdateProfileDto,
  UpdateRole,
} from '../users.dto';
import { RoleRepository } from '../../../repos/roles.repo';
import { UserRepository } from '../repos/user.repo';
import { isExist } from '../../../shared/repo.fun';
import { PasswordHashEngine } from '../../auth/hash.service';
import {
  EmailAlreadyExistError,
  PhoneAlreadyExistError,
  UserNameAlreadyExistError,
} from '../errors/users.error';
import { LanguageService } from '../../language/language.service';
import { EmailVerificationsRepository } from '../repos/verifyemail.repo';
import { EmailVerifications } from '../../../entities/verifyemail.entity';
import { EmailTokenSender } from '../../../mails/users/emailtoken.mailer';
import { use } from 'passport';
import { ForgotPassword } from 'src/entities/forgottenpassword.entity';
import { ForgotPasswordTokenSender } from 'src/mails/users/forgotpassword.mailer';
import { ForgotPasswordRepository } from '../repos/forgotpassword.repo';
import { extname } from 'path';

@Injectable()
export class UsersService {
  constructor(
    public readonly repository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly languageService: LanguageService,
    private readonly emailVerfications: EmailVerificationsRepository,
    private readonly password: ForgotPasswordRepository,
    private readonly emailTokenSend: EmailTokenSender,
    private readonly sendForgotPassword: ForgotPasswordTokenSender
  ) {}

  findAll(): Promise<UserEntity[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  findOne(id: number): Promise<UserEntity> {
    return this.repository.findOne(id);
  }

  findUserByEmail(email: string): Promise<UserEntity> {
    return this.repository.findOne({ where: { email } });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async isEmailExists(val) {
    return isExist(this.repository, 'email', val);
  }

  async isUserNameExists(val) {
    return isExist(this.repository, 'username', val);
  }

  async isPhoneExists(val) {
    return isExist(this.repository, 'mobile', val);
  }

  makeid(length) {
    let result = '' + Math.round(+new Date() / 1000);
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  isValidEmail(email: string) {
    if (email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    } else return false;
  }

  async createUser(user: CreateUserDto) {

    try {
      if (this.isValidEmail(user.email)) {
        let isAlreadyExist = await this.isEmailExists(user.email);
        if (isAlreadyExist) {
          throw EmailAlreadyExistError;
        }
        isAlreadyExist = await this.isUserNameExists(user.username);
        if (isAlreadyExist) {
          throw UserNameAlreadyExistError;
        }
        isAlreadyExist = await this.isPhoneExists(user.mobile);
        if (isAlreadyExist) {
          throw PhoneAlreadyExistError;
        }
        user.password = await PasswordHashEngine.make(user.password);
        const newUser = await this.repository.save(user);
          await this.createEmailToken(user.email);
          await this.emailTokenSend.sendEmailVerification(user.email);
        return { user: newUser };
      } else {
        throw new BadRequestException("Invalid email format");
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    var emailVerif = await this.emailVerfications.findOne({ emailToken: token });
    if (emailVerif) {
      var userFromDb = await this.repository.findOne({ where: { email: emailVerif.email } });
      if (userFromDb) {
        userFromDb.isActive = true;
        userFromDb.isApproved = true;
        var savedUser = await this.repository.update({ id: userFromDb.id as any }, userFromDb);
        await this.emailVerfications.remove(emailVerif);
        return !!savedUser;
      }
    } else {
      throw new HttpException(
        'LOGIN_EMAIL_CODE_NOT_VALID',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  
  async sendResetPasswordVerification(email: string): Promise<Boolean> {
    try {
      const forget = await this.createForgottenPasswordToken(email);
      return await this.sendForgotPassword.sendEmail(forget);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  
  async verifyResetPasswordToken(
    token: string,
    email: string,
  ): Promise<boolean> {
    var emailVerif = await this.password.findOne({
      where: {
        newPasswordToken: token,
        email: email,
      }
    });
    if (emailVerif && emailVerif.newPasswordToken) {
      var userFromDb = await this.repository.findOne({ where: { email: emailVerif.email } });
      if (userFromDb) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async createForgottenPasswordToken(email: string): Promise<ForgotPassword> {
    var forgottenPassword = await this.password.findOne({ where: { email: email } });
    if (
      forgottenPassword &&
      (new Date().getTime() -
        new Date(forgottenPassword.timestamp.toString()).getTime()) /
        60000 <
        15
    ) {
      throw new HttpException(
        'Please check your email for instructions, duplicate request within 15 minutes!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      let _emver = new ForgotPassword();
      if (!forgottenPassword) {
        _emver.email = email;
        _emver.newPasswordToken = this.makeid(60);
        _emver.timestamp = new Date();
        
        this.password.save(_emver);

        return _emver;
      } else {
        var forgottenPasswordModel = await this.password.update(
          { email: email },
          {
            newPasswordToken: this.makeid(60), //Generate 7 digits number,
            timestamp: new Date(),
          },
        );
        if (forgottenPasswordModel) {
          return this.password.findOne({ where: { email } });
        } else {
          throw new HttpException(
            'LOGIN_GENERIC_ERROR',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }
  }
  
  async createEmailToken(email: string): Promise<boolean> {
    var emailVerification = await this.emailVerfications.findOne({ where: { email: email } });

    if (
      emailVerification &&
      new Date().getTime() -
        new Date(emailVerification.timestamp.toString()).getTime() / 60000 <
        15
    ) {
      throw new HttpException(
        'LOGIN_EMAIL_SENT_RECENTLY',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    } else {
      console.log(emailVerification);
      var _emver = new EmailVerifications();
      if (!emailVerification) {
        _emver.email = email;
        _emver.emailToken = this.makeid(60);
        _emver.timestamp = new Date();
        await this.emailVerfications.save(_emver);
      } else {
        var emailVerificationModel = await emailVerificationModel.findOneAndUpdate(
          { email: email },
          {
            email: email,
            emailToken: this.makeid(60), //Generate 60 character
            timestamp: new Date(),
          },
          { upsert: true, new: true },
        );
      }
      return true;
    }
  }

  async updateUser(id: string | number|any, user: UpdateProfileDto) {
    const updateData: any = {};
    let isAlreadyExist: any;
    try {
      if (user.email && this.isValidEmail(user.email)) {
        isAlreadyExist = await this.isEmailExists(user.email);
        if (isAlreadyExist && isAlreadyExist.email !== user.email) {
          throw EmailAlreadyExistError;
        }
        updateData.email = user.email;
      }

      if (user.username) {
        isAlreadyExist = await this.isUserNameExists(user.username);
        if (isAlreadyExist && isAlreadyExist.username !== user.username) {
          throw UserNameAlreadyExistError;
        }
        updateData.username = user.username;
      }

      if (user.password) {
        user.password = await PasswordHashEngine.make(user.password);
        updateData.password = user.password;
      }
      if (user.mobile) {
        updateData.mobile = user.mobile;
      }
      if (user.meta) {
        updateData.meta = user.meta;
      }
      
      if (user.isActive) {
        updateData.isActive = user.isActive;
      }

      if (user.gender) {
        updateData.gender = user.gender;
      }

      if (user.language) {
        updateData.language = user.language;
      }
      if (user.age) {
        updateData.age = user.age;
      }
      if (user.statusMessage) {
        updateData.statusMessage = user.statusMessage;
      }
      if (user.location) {
        updateData.location = user.location;
      }
      
      
      if (user.firstName) {
        updateData.firstName = user.firstName;
      }
      
      if (user.lastName) {
        updateData.lastName = user.lastName;
      }
      const updateUser = await this.repository.update(id, updateData);
      return { user: plainToClass(UserEntity, updateUser) };
    } catch (error) {
      throw error;
    }
  }

  async updateRoles(id: string | number, user: UpdateRole) {
    const RoleId = user.roleId;
    const users = await this.repository.findOne(id, {
      relations: ['roles'],
    });
    console.log(users);

    // await this.repository.save(users);
    const allRoles = await this.roleRepository
      .createQueryBuilder('s')
      .where(' s.id IN (:...RoleId)', { RoleId })
      .getMany();
    console.log(allRoles);
    users.roles = allRoles;
    await this.repository.save(users);
  }


  async deleteUserPic(user: UserEntity) {
    const dbRes = await this.repository.update(user.id, { image: null });
    return dbRes;
  }

  async setProfileImage(
    user: UserEntity,
    file
  ) {
      user.image = file.originalname;
      await this.repository.save(user);
      return true;
  }

  async searchUserForAuth(username) {
    try {
      const user = await this.repository
        .createQueryBuilder('users')
        .where('users.username = :val OR users.email = :val', { val: username })
        .getOne();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async isTFARequire(username: string) {
    try {
      const user = await this.repository
        .createQueryBuilder('users')
        .select("users.meta->'$.TFARequire' as 'TFARequire'")
        .where('users.username = :val OR users.email = :val', { val: username })
        .getRawOne();
      return { TFARequire: !!(user.TFARequire && user.TFARequire !== 'false') };
    } catch (error) {
      throw error;
    }
  }
}
