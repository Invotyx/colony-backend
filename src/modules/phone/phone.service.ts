import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { env } from 'process';
import { UserEntity } from 'src/entities/user.entity';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import Stripe from 'stripe';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PaymentMethodsService } from '../products/services/payment-methods.service';
import { PhonesRepository } from './phone.repo';

@Injectable()
export class PhoneService {
  private client;
  private stripe: Stripe;
  constructor(
    public readonly repo: PhonesRepository,
    public readonly cityCountry: CityCountryService,
    public readonly payment: PaymentMethodsService,
    public readonly paymentHistory: PaymentHistoryService,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
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

  public async purchasePhoneNumber(
    cc: string,
    num: string,
    user: UserEntity,
    type = 'phone',
  ) {
    try {
      if (env.NODE_ENV !== 'development') {
        try {
          if (type != 'sub') {
            //get phone costing from country...
            const country = await this.cityCountry.countryRepo.findOne({
              where: { code: cc.toUpperCase() },
            });
            if (country) {
              //get default payment method
              const default_pm = await this.payment.repository.findOne({
                where: { default: true, user: user },
              });
              if (default_pm) {
                //create charge
                const charge = await this.stripe.charges.create({
                  amount: country.phoneCost * 100,
                  currency: 'GBP',
                  customer: user.customerId,
                  capture: true,
                  source: default_pm.id,
                });

                if (charge.status == 'succeeded') {
                  //proceed if charge is successful.
                  const number = await this.client.incomingPhoneNumbers.create({
                    phoneNumber: num,
                  });
                  await this.paymentHistory.repository.save({
                    packageCost: country.phoneCost,
                    user: user,
                    description:
                      'Phone number: ' + number.phoneNumber + ' purchased.',
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
                      type: 'extra',
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
                } else {
                  //fail if unsuccessful.
                  throw new BadRequestException(
                    'Payment against your default card is failed. Details: ' +
                      charge.failure_code +
                      charge.failure_message,
                  );
                }
              } else {
                throw new BadRequestException(
                  'Please add a payment method or set one of your payment methods as default.',
                );
              }
            } else {
              throw new BadRequestException(
                'This country is not included in Active Phone number purchase list.',
              );
            }
          } else {
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
                type: 'default',
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
