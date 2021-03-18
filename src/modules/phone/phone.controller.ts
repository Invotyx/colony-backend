import {
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
import { PhoneService } from './phone.service';

@Injectable()
@Controller('phone')
@ApiTags('phone')
export class PhoneController {
  constructor(private readonly service: PhoneService) {}

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('search-numbers')
  async searchNumbers(
    @Query('country') country: string,
    @Query('limit') limit: number,
    @Query('number_must_contain') numberShouldContain = '',
  ) {
    try {
      return await this.service.searchPhoneNumbers(
        country,
        limit,
        numberShouldContain,
      );
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('purchase-numbers')
  public async purchasePhoneNumber(
    @LoginUser() user: UserEntity,
    @Query('country') country: string,
    @Query('number') number: string,
  ) {
    try {
      return await this.service.purchasePhoneNumber(country, number, user);
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
      return await this.service.cancelPhoneNumber(number, user);
    } catch (e) {
      throw e;
    }
  }
}
