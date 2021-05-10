import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { PaymentHistoryService } from './payment-history.service';

@Controller('payment-history')
export class PaymentHistoryController {
  constructor(private readonly service: PaymentHistoryService) {}

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('sms/spending')
  async smsSpending(@LoginUser() user: UserEntity) {
    try {
      return this.service.getDues('sms', user);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('contacts/spending')
  async contactsSpending(@LoginUser() user: UserEntity) {
    try {
      return this.service.getDues('contacts', user);
    } catch (e) {
      throw e;
    }
  }


  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('')
  async purchaseHistory(@LoginUser() user: UserEntity) {
    try {
      const history = await this.service.history(user);
      return history;
    } catch (e) {
      throw e;
    }
  }
}
