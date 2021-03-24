import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as faker from 'faker';
import { env } from 'process';
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
    private readonly userService: UsersService,
    public readonly repo: PhonesRepository,
  ) {
    this.key = env.MESSAGEBIRD_KEY_TEST;
    //this.mb = initMB(env.MESSAGEBIRD_KEY);
  }

  public async searchPhoneNumbers(
    cc: string,
    limit: number,
    numberShouldContain = '',
  ) {
    const data: any = {
      number: numberShouldContain,
      type: 'mobile',
      search_pattern: 'start',
      limit: limit,
    };
    const country = cc;
    //
    try {
      const numbers = await this.apiCaller.apiCaller(
        'GET',
        'https://numbers.messagebird.com/v1/available-phone-numbers/' +
          country +
          this.serialize(data),
        { key: 'AccessKey', value: this.key },
      );
      return { numbers: numbers.items };
    } catch (e) {
      throw e;
    }
  }

  public async purchasePhoneNumber(cc: string, num: string, user: UserEntity) {
    try {
      if (user.purchasedPhoneNumberCredits > 0) {
        if (user.purchasedPhoneNumberCredits - user.purchasedPhoneCount > 0) {
          const data: any = {
            number: num,
            countryCode: cc.toUpperCase(),
            billingIntervalMonths: 1,
          };
          if (env.NODE_ENV !== 'development') {
            const number = await this.apiCaller.apiCaller(
              'POST',
              'https://numbers.messagebird.com/v1/phone-numbers/' +
                this.serialize(data),
              { key: 'AccessKey', value: this.key },
            );
            // save to database;
            
            await this.repo.save({
              country: number.country,
              features: number.features.join(','),
              number: number.number,
              renewalDate: number.renewalAt,
              status: number.status,
              type: number.type,
              user: user,
            });
            user.purchasedPhoneCount = user.purchasedPhoneCount + 1;
            await this.userService.repository.save(user);
            return {
              number,
              message:
                'Number purchased and linked to your account successfully.',
            };
          } else {
            let countryCode: any = await this.apiCaller.apiCaller(
              'GET',
              'https://restcountries.eu/rest/v2/alpha/' + cc.toLowerCase(),
              { key: 'AccessKey', value: 'dummy' },
            );
            countryCode = countryCode.callingCodes;
            const dummy = {
              number: num,
              country: cc.toUpperCase(),
              region: 'Haarlem',
              locality: 'Haarlem',
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
            user.purchasedPhoneCount = user.purchasedPhoneCount + 1;
            await this.userService.repository.save(user);
            // save to database;
            return {
              number: dummy,
              message:
                'Number purchased and linked to your account successfully.',
            };
          }
        } else {
          throw new HttpException(
            'You have already consumed your phone number credits.',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'You have to purchase subscription to buy phone numbers.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
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
          a.push(k + '=' + encodeURIComponent(obj[k]));
          return a;
        }, [])
        .join('&');
    return str;
  }
}
