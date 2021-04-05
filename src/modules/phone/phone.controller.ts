import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Injectable,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { CountryRepository } from 'src/services/city-country/repos/country.repo';
import { PhoneService } from './phone.service';

@Injectable()
@Controller('phone')
@ApiTags('phone')
export class PhoneController {
  constructor(
    private readonly service: PhoneService,
    private readonly countryRepo: CountryRepository 
  ) { }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('search-numbers')
  async searchNumbers(
    @Query('country') country: string,
    @Query('limit') limit: number,
    @Query('number_must_have') number_must_have: string = '',
  ) {
    try {
      
      const cc = await this.countryRepo.findOne({ where: { id: country, active: true } });
      if (cc) {
        if (limit < 1 || limit > 25) {
          throw new BadRequestException(
            'Limit should be greater then 0 and less then 25.',
          );
        }
        if (number_must_have && number_must_have.length > 5) {
          throw new BadRequestException(
            'Number search parameter length should be less then 5 characters.',
          );
        }
        return await this.service.searchPhoneNumbers(
          cc.code.toUpperCase(),
          limit,
          number_must_have,
        );
      } else {
        throw new BadRequestException('Country is not available for purchasing numbers.');
      }
    } catch (e) {
      throw e;
    }
  }
  /* 
  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('purchase-numbers')
  public async purchasePhoneNumber(
    @LoginUser() user: UserEntity,
    @Query('country') country: string,
    @Query('number') number: string,
  ) {
    try {
      if (country.length !== 2) {
        throw new BadRequestException('Country Code should be in ISO 2 Code Format eg. GB for United Kingdom');
      }
      if (number.length < 10 || number.length > 20 ) {
        throw new BadRequestException('Number should be in international format and length should be between 10 to 20 characters.');
      }
      return await this.service.purchasePhoneNumber(country, number, user);
    } catch (e) {
      throw e;
    }
  } */

  /* @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Delete('cancel-number')
  public async cancelPhoneNumber(
    @LoginUser() user: UserEntity,
    @Query('number') number: string,
  ) {
    try {
      return await this.service.cancelPhoneNumber(number, user);
    } catch (e) {
      throw e;
    }
  } */
}
