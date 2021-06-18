import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Post,
  Query
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  constructor(
    private readonly service: PhoneService,
    private readonly countryRepo: CountryRepository,
  ) {}

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('my-numbers')
  async getPurchasedPhoneNumbers(@LoginUser() user: UserEntity) {
    try {
      const countries = await this.countryRepo.find({
        where: { active: true },
      });
      const numbers = await this.service.getPurchasedPhoneNumbers(user);
      let nums = [];
      for (let number of numbers) {
        var country = this.search(number.country, countries);
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
  @Delete('cancel-number')
  public async cancelPhoneNumber(
    @LoginUser() user: UserEntity,
    @Query('number') number: string,
  ) {
    try {
      return this.service.cancelPhoneNumber(number, user);
    } catch (e) {
      throw e;
    }
  }
}
