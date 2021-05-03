import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { env } from 'process';
import { UserEntity } from 'src/entities/user.entity';
import { PhonesRepository } from './phone.repo';

@Injectable()
export class PhoneService {
  private client;
  constructor(public readonly repo: PhonesRepository) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
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
      const numbers = await this.client
        .availablePhoneNumbers(country)
        .mobile.list({
          contains: number_must_have,
          smsEnabled: true,
          limit: 20,
        });
      return { numbers: numbers };
    } catch (e) {
      throw e;
    }
  }

  public async purchasePhoneNumber(cc: string, num: string, user: UserEntity) {
    try {
      if (env.NODE_ENV !== 'development') {
        try {
          const number = await this.client.incomingPhoneNumbers.create({
            phoneNumber: num,
          });

          // save to database;
          if (number) {
            const date = new Date(); // Now
            date.setDate(date.getDate() + 30);
            await this.repo.save({
              country: cc.toUpperCase(),
              features: number.capabilities.join(','),
              number: number.phoneNumber,
              renewalDate: date,
              status: number.status,
              sid: number.sid,
              user: user,
            });

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
        } catch (ex) {
          throw ex;
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
          sid: 'landline_or_mobile',
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
          sid: dummy.sid,
          user: user,
        });

        return {
          number: dummy,
          message:
            'Dummy Number purchased and linked to your account successfully.',
        };
      }
    } catch (err) {
      throw new BadRequestException({
        status: err.status,
        message: err.message,
        code: err.code,
      });
    }
  }

  public async cancelPhoneNumber(num: string, user: UserEntity) {
    try {
      if (env.NODE_ENV !== 'development') {
        const numb = await this.repo.findOne({
          where: { user: user, number: num, status: 'active' },
        });
        if (numb) {
          const number = this.client.incomingPhoneNumbers(numb.sid).remove();

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
