import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { SmsService } from './sms.service';

@Controller('sms')
@ApiTags('sms')
export class SmsController {
  constructor(private readonly service: SmsService) {}

  @ApiBody({ required: true })
  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('template/create')
  async createSmsTemplate(
    @LoginUser() influencer: UserEntity,
    @Body('body') body: string,
  ) {
    try {
      const template = await this.service.createSmsTemplate(body, influencer);
      return template;
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ required: true })
  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Put('template/:id/update')
  async updateSmsTemplate(
    @LoginUser() influencer: UserEntity,
    @Param('id') id: number,
    @Body('body') body: string,
  ) {
    try {
      const template = await this.service.updateSmsTemplate(
        id,
        body,
        influencer,
      );
      return template;
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Delete('template/:id/delete')
  async deleteSmsTemplate(@Param('id') id: number) {
    try {
      const template = await this.service.deleteSmsTemplate(id);
      return template;
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('template')
  async getSmsTemplates(@LoginUser() influencer: UserEntity) {
    try {
      const templates = await this.service.getSmsTemplates(influencer);
      return templates;
    } catch (e) {
      throw e;
    }
  }
}
