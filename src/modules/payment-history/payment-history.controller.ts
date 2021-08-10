import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { ROLES } from '../../services/access-control/consts/roles.const';
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
  @Get('charge-sms-threshold')
  async chargeOnThreshold(@LoginUser() user: UserEntity) {
    return this.service.chargeOnThreshold(user);
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

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('html/:id')
  async generateHtmlForInvoice(
    @LoginUser() user: UserEntity,
    @Param('id') id: number,
  ) {
    try {
      const history = await this.service.generateHtmlForInvoice(id,user);
      return history;
    } catch (e) {
      throw e;
    }
  }
}
