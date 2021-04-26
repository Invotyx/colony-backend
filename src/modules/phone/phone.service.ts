import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { env } from 'process';
import * as faker from 'faker';
import { UserEntity } from 'src/entities/user.entity';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { UsersService } from '../users/services/users.service';
import { PhonesRepository } from './phone.repo';

@Injectable()
export class PhoneService {
  //private mb: MessageBird;
  private key: string;
  constructor(
    private readonly apiCaller: ApiCallingService,
    public readonly repo: PhonesRepository,
  ) {
    //this.key = env.MESSAGEBIRD_KEY_TEST;
    this.key = env.MESSAGEBIRD_KEY;
    //this.mb = initMB(env.MESSAGEBIRD_KEY);
  }

  public async searchPhoneNumbers(
    cc: string,
    limit: number,
    number_must_have: string = '',
  ) {
    const data: any = {
      type: 'mobile',
      search_pattern: 'start',
      limit: limit,
      number: number_must_have,
    };
    const country = cc.toUpperCase();
    //
    try {
      const numbers = await this.apiCaller.apiCaller(
        'GET',
        'https://numbers.messagebird.com/v1/available-phone-numbers/' +
          country +
          this.serialize(data),
        { key: 'AccessKey', value: this.key },
      );
      return { numbers: numbers };
    } catch (e) {
      throw e;
    }
  }

  public async purchasePhoneNumber(cc: string, num: string, user: UserEntity) {
    try {
      /*       if (user.purchasedPhoneNumberCredits > 0) {
              if (user.purchasedPhoneNumberCredits - user.purchasedPhoneCount > 0) { */
      const data: any = {
        number: num.toString(),
        countryCode: cc.toUpperCase(),
        billingIntervalMonths: 1,
      };

      if (env.NODE_ENV !== 'development') {
        const number = await this.apiCaller.apiCaller(
          'POST',
          'https://numbers.messagebird.com/v1/phone-numbers',
          { key: 'AccessKey', value: this.key },
          data
        );

        // save to database;
        if (number && number.status && number.status == 'active') {
          await this.repo.save({
            country: number.country,
            features: number.features.join(','),
            number: number.number,
            renewalDate: number.renewalAt,
            status: number.status,
            type: number.type,
            user: user,
          });
          /* user.purchasedPhoneCount = user.purchasedPhoneCount + 1;
          await this.userService.repository.save(user); */
          return {
            number,
            message:
              'Number purchased and linked to your account successfully.',
          };
        } else {
          throw new BadRequestException(
            'An error ocurred while number purchasing, try again later.',
          );
        }
      } else {
        console.log('=== dummy ===');
        const dummy = {
          number: num,
          country: cc.toUpperCase(),
          region: '',
          locality: '',
          features: ['sms', 'mms', 'voice'],
          tags: [],
          type: 'landline_or_mobile',
          status: 'active',
          createdAt: '2019-04-25T14:04:04Z',
          renewalAt: '2019-05-25T00:00:00Z',
        };

        await this.repo.save({
          country: dummy.country,
          features: dummy.features.join(','),
          number: dummy.number,
          renewalDate: dummy.renewalAt,
          status: dummy.status,
          type: dummy.type,
          user: user,
        });

        return {
          number: dummy,
          message:
            'Dummy Number purchased and linked to your account successfully.',
        };
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async cancelPhoneNumber(num: string, user: UserEntity) {
    try {
      if (env.NODE_ENV !== 'development') {
        const numb = await this.repo.findOne({
          where: { user: user, number: num, status: 'active' },
        });
        if (numb) {
          const number = await this.apiCaller.apiCaller(
            'DELETE',
            'https://numbers.messagebird.com/v1/phone-numbers/' + num,
            { key: 'AccessKey', value: this.key },
          );

          numb.status = 'canceled';
          await this.repo.save(numb);

          // save to database;
          return {
            number,
            message: 'Phone number is cancelled and can no longer be useable.',
          };
        } else {
          throw new HttpException(
            'Phone number not found',
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        const numb = await this.repo.findOne({
          where: { user: user, number: num, status: 'active' },
        });
        if (numb) {
          numb.status = 'canceled';
          await this.repo.save(numb);
          return {
            message: 'Phone number is cancelled and can no longer be useable.',
          };
        } else {
          throw new HttpException(
            'Phone number not found',
            HttpStatus.NOT_FOUND,
          );
        }
      }
    } catch (e) {
      throw e;
    }
  }

  private serialize(obj) {
    const str =
      '?' +
      Object.keys(obj)
        .reduce(function (a, k) {
          if (Array.isArray(obj[k])) {
            if (obj[k].length !== 0) {
              obj[k] = obj[k].join('&' + k + '=');
              a.push(k + '=' + obj[k]);
            }
          } else {
            a.push(k + '=' + obj[k]);
          }

          return a;
        }, [])
        .join('&');

    console.log(str);
    return str;
  }
}
