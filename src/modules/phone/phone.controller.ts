import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { CountryRepository } from '../../services/city-country/repos/country.repo';
import { PhoneService } from './phone.service';

@Injectable()
@Controller('phone')
@ApiTags('phone')
export class PhoneController {
  private client;
  constructor(
    private readonly service: PhoneService,
    private readonly countryRepo: CountryRepository,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
  }

  @Post('voice')
  async voicemail(req: Request, res: Response) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    const number = await this.service.findOne({
      where: {
        number: req.body.To,
      },
      relations: ['user'],
    });
    if (number.user.voiceUrl) twiml.play({}, number.user.voiceUrl);
    else
      twiml.say(
        { voice: 'alice' },
        `Your call cannot be placed at the moment. Kindly send sms to this number.`,
      );

    res.type('text/xml');
    res.send(twiml.toString());
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('my-numbers')
  async getPurchasedPhoneNumbers(@LoginUser() user: UserEntity) {
    try {
      const countries = await this.countryRepo.find();
      const numbers = await this.service.getPurchasedPhoneNumbers(user);
      let nums = [];
      for (let number of numbers) {
        let country = this.search(number.country, countries);
        number.country = country as any;
        nums.push(number);
      }
      return nums;
    } catch (e) {
      throw e;
    }
  }

  search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].code === nameKey) {
        return myArray[i];
      }
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('search-numbers')
  async searchNumbers(
    @Query('country') country: string,
    @Query('limit') limit: number,
    @Query('number_must_have') number_must_have: string = '',
  ) {
    try {
      return this.service.searchNumbers(country, limit, number_must_have);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('purchase-numbers')
  public async purchasePhoneNumber(
    @LoginUser() user: UserEntity,
    @Body('country') country: string,
    @Body('number') number: string,
  ) {
    try {
      return this.service.initiatePurchasePhoneNumber(user, country, number);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Delete(':number')
  public async cancelPhoneNumber(
    @LoginUser() user: UserEntity,
    @Param('number') number: string,
  ) {
    try {
      return this.service.cancelPhoneNumber(number, user);
    } catch (e) {
      throw e;
    }
  }
}
