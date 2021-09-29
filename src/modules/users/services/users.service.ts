import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as fs from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';
import { env } from 'process';
import { TABLES } from 'src/consts/tables.const';
import { ForgotPasswordTokenSender } from 'src/mails/users/forgotpassword.mailer';
import { presetTrigger } from 'src/modules/sms/entities/preset-message.entity';
import { PresetMessagesRepository } from 'src/modules/sms/repo/sms-presets.repo';
import { ForgotPassword } from 'src/modules/users/entities/forgottenpassword.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { CityRepository } from 'src/services/city-country/repos/city.repo';
import { CountryRepository } from 'src/services/city-country/repos/country.repo';
import { error } from 'src/shared/error.dto';
import {
  columnListToSelect,
  dataViewer,
  mapColumns,
  paginateQuery,
  PaginatorError,
  PaginatorErrorHandler
} from 'src/shared/paginator';
import { Not } from 'typeorm';
import { EmailTokenSender } from '../../../mails/users/emailtoken.mailer';
import { RoleRepository } from '../../../repos/roles.repo';
import { PasswordHashEngine } from '../../../shared/hash.service';
import { isExist } from '../../../shared/repo.fun';
import { UserEntity } from '../entities/user.entity';
import { EmailVerifications } from '../entities/verifyemail.entity';
import {
  EmailAlreadyExistError,
  PhoneAlreadyExistError,
  UserNameAlreadyExistError
} from '../errors/users.error';
import { ForgotPasswordRepository } from '../repos/forgotpassword.repo';
import { UserRepository } from '../repos/user.repo';
import { EmailVerificationsRepository } from '../repos/verifyemail.repo';
import {
  CreateUserDto,
  UpdateProfileDto,
  UpdateProfilePasswordDto,
  UpdateRole
} from '../users.dto';

@Injectable()
export class UsersService {
  private client;
  constructor(
    private readonly repository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly emailVerfications: EmailVerificationsRepository,
    private readonly password: ForgotPasswordRepository,
    private readonly emailTokenSend: EmailTokenSender,
    private readonly sendForgotPassword: ForgotPasswordTokenSender,
    private readonly country: CountryRepository,
    private readonly city: CityRepository,
    private readonly presetRepo: PresetMessagesRepository,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
  }

  findAll(): Promise<UserEntity[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async save(user: any) {
    return this.repository.save(user);
  }

  async findOne(condition?: any): Promise<UserEntity> {
    return this.repository.findOne(condition);
  }

  findUserByEmail(email: string): Promise<UserEntity> {
    return this.repository.findOne({ where: { email } });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async isEmailExists(val: any) {
    return isExist(this.repository, 'email', val);
  }

  async isUserNameExists(val: any) {
    return isExist(this.repository, 'username', val);
  }

  async isPhoneExists(val: any) {
    return isExist(this.repository, 'mobile', val);
  }

  async getAllUsers(data: any) {
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
      const query = await this.repository
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

  makeid(length: any) {
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
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    } else return false;
  }

  async createUser(user: CreateUserDto) {
    try {
      if (this.isValidEmail(user.email.toLowerCase())) {
        let count = await this.repository.count({
          where: { email: user.email.toLowerCase() },
        });

        if (count > 0) {
          throw new BadRequestException(EmailAlreadyExistError);
        }

        count = await this.repository.count({
          where: { username: user.username.toLowerCase() },
        });
        if (count > 0) {
          throw new BadRequestException(UserNameAlreadyExistError);
        }
        count = await this.repository.count({ where: { mobile: user.mobile } });
        if (count > 0) {
          throw new BadRequestException(PhoneAlreadyExistError);
        }

        user.password = await PasswordHashEngine.make(user.password);
        user.urlId = nanoid(10);
        user.username = user.username.toLowerCase();
        const newUser: UserEntity = await this.repository.save(user);
        const roles = await this.roleRepository.findOne({
          where: { role: ROLES.INFLUENCER },
        });
        await this.updateRoles(newUser.id, {
          userId: newUser.id,
          roleId: [roles.id],
        });

        Promise.all([
          this.presetRepo.save({
            body:
              'Hi, You have subscribed to ${inf_first_name}. Please complete your profile using this link ${link}',
            name: 'Welcome',
            trigger: presetTrigger.welcome,
            user: newUser,
          }),
          this.presetRepo.save({
            body:
              'Welcome ${first_name}! Glad to have you onboard.  Regards ${inf_first_name}. ',
            name: 'OnBoard',
            trigger: presetTrigger.onBoard,
            user: newUser,
            fixedText:
              'Msg frequency will vary. Msg & Data rates may apply. Reply HELP for help, STOP to cancel.',
          }),

          this.presetRepo.save({
            body:
              'Hi! This is ${inf_first_name}. You recently sent an sms to my number. Please complete your profile using this link ${link} so that I can get to know my fans better!',
            name: 'NoResponse',
            trigger: presetTrigger.noResponse,
            user: newUser,
            enabled: true,
          }),
        ]);
        return { user: newUser };
      } else {
        throw new BadRequestException('Invalid email format');
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<any> {
    const emailVerif = await this.emailVerfications.findOne({
      emailToken: token,
    });
    if (emailVerif) {
      const userFromDb = await this.repository.findOne({
        where: { email: emailVerif.email },
      });
      userFromDb.isActive = true;
      userFromDb.isApproved = true;
      await this.repository.save(userFromDb);
      await this.emailVerfications.delete(emailVerif);

      return userFromDb;
    } else {
      throw new HttpException(
        'LOGIN_EMAIL_CODE_NOT_VALID',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async sendResetPasswordVerification(email: string): Promise<boolean> {
    try {
      const forget = await this.createForgottenPasswordToken(email);
      return this.sendForgotPassword.sendEmail(forget);
    } catch (e) {
      ////console.log(e);
      throw e;
    }
  }

  async verifyResetPasswordToken(
    token: string,
    email: string,
  ): Promise<UserEntity> {
    const emailVerif = await this.password.findOne({
      where: {
        newPasswordToken: token,
        email: email,
      },
    });
    if (emailVerif && emailVerif.newPasswordToken) {
      const userFromDb = await this.repository.findOne({
        where: { email: emailVerif.email },
      });
      if (userFromDb) {
        return userFromDb;
      } else {
        throw new NotFoundException('User not found');
      }
    } else {
      throw new NotFoundException('Invalid Token');
    }
  }

  async createForgottenPasswordToken(email: string): Promise<ForgotPassword> {
    const user = await this.repository.findOne({
      where: { email: email },
    });
    if (user) {
      const forgottenPassword = await this.password.findOne({
        where: { email: email },
      });
      if (
        forgottenPassword &&
        (new Date().getTime() -
          new Date(forgottenPassword.timestamp.toString()).getTime()) /
          60000 <
          15
      ) {
        throw new HttpException(
          'Please check your email for instructions, duplicate request within 15 minutes!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const _emver = new ForgotPassword();
        if (!forgottenPassword) {
          _emver.email = email;
          _emver.newPasswordToken = this.makeid(60);
          _emver.timestamp = new Date();

          this.password.save(_emver);

          return _emver;
        } else {
          const forgottenPasswordModel = await this.password.update(
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
              'Invalid data, try again.',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }
    } else {
      throw new HttpException(
        'Influencer has not activated his/her profile yet.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerfications.findOne({
      where: { email: email },
    });

    if (
      emailVerification &&
      new Date().getTime() -
        new Date(emailVerification.timestamp.toString()).getTime() / 60000 <
        15
    ) {
      throw new HttpException(
        'Login email sent recently.',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    } else {
      const _emver = new EmailVerifications();
      if (!emailVerification) {
        _emver.email = email;
        _emver.emailToken = this.makeid(60);
        _emver.timestamp = new Date();
        await this.emailVerfications.save(_emver);
      } else {
        await this.emailVerfications.update(
          { email: email },
          {
            email: email,
            emailToken: this.makeid(60), //Generate 60 character
            timestamp: new Date(),
          },
        );
      }
      return true;
    }
  }

  async updateUser(id: string | number | any, user: UpdateProfileDto) {
    const updateData = await this.repository.findOne({
      where: { id: id },
    });
    // let isAlreadyExist: any;
    try {
      const phone = await this.repository.findOne({
        where: { mobile: user.mobile, id: Not(id) },
      });
      if (phone) {
        throw new HttpException(
          'Phone number already exists.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (user.mobile) {
        updateData.mobile = user.mobile;
      }
      if (user.meta) {
        updateData.meta = user.meta;
      }
      if (user.require2fa) {
        updateData.require2fa = user.require2fa;
      }

      updateData.gender = user.gender;

      updateData.dob = user.dob ? user.dob : null;

      updateData.statusMessage = user.statusMessage;

      if (!user.city) {
        updateData.city = null;
      } else {
        const _c = await this.city.findOne({ where: { id: user.city } });
        if (_c) updateData.city = _c;
      }

      if (!user.country) {
        updateData.country = null;
      } else {
        const _c = await this.country.findOne({
          where: { id: user.country },
        });
        if (_c) updateData.country = _c;
      }

      if (user.firstName) {
        updateData.firstName = user.firstName;
      }

      if (user.lastName) {
        updateData.lastName = user.lastName;
      }
      updateData.timezone = user.timezone;
      ////console.log('updateData: ', updateData);
      ////console.log('user: ', user);

      await this.repository.save(updateData);
      return { message: 'User details updated.' };
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(
    id: string | number | any,
    data: UpdateProfilePasswordDto,
  ) {
    const updateData = await this.repository.findOne({
      where: { id: id },
    });

    try {
      if (data.password && !data.oldPassword) {
        throw new HttpException(
          error(
            [
              {
                key: 'oldPassword',
                reason: 'MissingValue',
                description: 'Your old password cannot be empty.',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      if (!data.password && data.oldPassword) {
        throw new HttpException(
          error(
            [
              {
                key: 'password',
                reason: 'MissingValue',
                description: 'Password cannot be empty.',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (!data.confirmPassword && data.password) {
        throw new HttpException(
          error(
            [
              {
                key: 'confirmPassword',
                reason: 'MissingValue',
                description: 'Confirm Password cannot be empty.',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      if (data.password && data.oldPassword) {
        if (data.oldPassword == data.password) {
          throw new HttpException(
            error(
              [
                {
                  key: 'password',
                  reason: 'Mismatch',
                  description:
                    'Your old password is same as new password you have provided.',
                },
              ],
              HttpStatus.UNPROCESSABLE_ENTITY,
              'Unprocessable entity',
            ),
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        const oldPassword = await PasswordHashEngine.check(
          data.oldPassword,
          updateData.password,
        );
        if (!oldPassword) {
          throw new HttpException(
            error(
              [
                {
                  key: 'oldPassword',
                  reason: 'Mismatch',
                  description:
                    'Your old password does not match with password you have provided.',
                },
              ],
              HttpStatus.UNPROCESSABLE_ENTITY,
              'Unprocessable entity',
            ),
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        data.password = await PasswordHashEngine.make(data.password);
        updateData.password = data.password;
      }
      await this.repository.save(updateData);
      return { message: 'Password changed.' };
    } catch (error) {
      throw error;
    }
  }

  async updateRoles(id: string | number, user: UpdateRole) {
    const RoleId = user.roleId;
    const users = await this.repository.findOne(id, {
      relations: ['roles'],
    });
    ////console.log(users);

    // await this.repository.save(users);
    const allRoles = await this.roleRepository
      .createQueryBuilder('s')
      .where(' s.id IN (:...RoleId)', { RoleId })
      .getMany();
    ////console.log(allRoles);
    users.roles = allRoles;
    await this.repository.save(users);
  }

  async deleteUserPic(user: UserEntity) {
    const dbRes = await this.repository.update(user.id, { image: null });
    return dbRes;
  }
  async deleteUserVoiceMail(user: UserEntity) {
    const _user = await this.repository.findOne(user.id);
    if (_user.voiceUrl) {
      const filePath = join(__dirname, '../../../..', 'uploads', _user.voiceUrl);
      fs.unlinkSync(filePath);
    }
    const dbRes = await this.repository.update(_user.id, { voiceUrl: null });
    return dbRes;
  }

  async setProfileImage(user: UserEntity, file: any) {
    if (user.image) {
      const filePath = join(__dirname, '../../../..', 'uploads', user.image);
      fs.unlinkSync(filePath);
    }
    user.image = file.filename;
    await this.repository.save(user);
    return { profileImage: user.image };
  }

  async setVoicemail(user: UserEntity, file: any) {
    if (user.voiceUrl) {
      const filePath = join(__dirname, '../../../..', 'uploads', user.voiceUrl);
      fs.unlinkSync(filePath);
    }
    user.voiceUrl = file.filename;
    await this.repository.save(user);

    const phoneNumbers = await this.repository.findOne({
      where: {
        id: user.id,
      },
      relations: ['numbers'],
    });

    phoneNumbers.numbers.forEach(async (number) => {
      await this.client.incomingPhoneNumbers(number.sid).update({
        voiceUrl: env.API_URL + '/api/phone/voice',
      });
    });

    return {
      voiceUrl: user.voiceUrl,
      message: 'Voicemail is set for your purchased numbers.',
    };
  }

  async searchUserForAuth(username: string) {
    try {
      const user = await this.repository
        .createQueryBuilder('users')
        .where('users.username = :val OR users.email = :val', {
          val: username.toLowerCase(),
        })
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
