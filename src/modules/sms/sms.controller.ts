import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { Response } from 'express';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { UserEntity } from '../users/entities/user.entity';
import { BroadcastService } from './broadcast.service';
import { PresetsDto, PresetsUpdateDto, presetTrigger } from './preset.dto';
import { SmsService } from './sms.service';

@Controller('sms')
@ApiTags('sms')
export class SmsController {
  constructor(
    private readonly service: SmsService,
    private readonly broadcastService: BroadcastService,
    @InjectQueue('receive_sms_and_send_welcome') private readonly queue: Queue,
  ) {}

  @Post('receive-sms/webhook')
  @HttpCode(200)
  async receiveSms(@Body() body: any, @Res() res: Response) {
    try {
      await this.queue.add('inboundSms', body, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 2,
      });

      res.status(200).send();
    } catch (e) {
      throw e;
    }
  }

  @Post('receive-sms-status-callback/webhook')
  @HttpCode(200)
  async receiveSmsStatusCallback(@Body() body: any, @Res() res: Response) {
    try {
      await this.queue.add('outBoundSmsStatus', body, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 2,
      });

      res.status(200).send('OK');
    } catch (e) {
      throw e;
    }
  }

  //#region  conversation
  @Auth({})
  @Get('/conversations')
  async getConversations(@LoginUser() inf: UserEntity) {
    try {
      return await this.service.getConversations(inf);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Get('/conversation/:contact')
  async getConversation(
    @LoginUser() inf: UserEntity,
    @Param('contact') contact: string,
  ) {
    try {
      return await this.service.getConversation(inf, contact);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Delete('/conversation/:contact')
  async deleteConversation(
    @LoginUser() inf: UserEntity,
    @Param('contact') contact: string,
  ) {
    try {
      return await this.service.deleteConversation(inf, contact);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Delete('/conversation/sms/:smsId')
  async deleteSms(@LoginUser() inf: UserEntity, @Param('smsId') smsId: string) {
    try {
      return await this.service.deleteMessage(smsId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Post('/conversation')
  async sendSms(
    @LoginUser() inf: UserEntity,
    @Body('to') contact: string,
    @Body('message') message: string,
    @Body('from') phoneNumber: string,
  ) {
    try {
      return this.service.initiateSendSms(inf, contact, message, phoneNumber);
    } catch (e) {
      throw e;
    }
  }
  //#endregion

  //#region broadcast

  //#endregion

  //#region  message templates
  @ApiBody({ required: true })
  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('template/create')
  async createSmsTemplate(
    @LoginUser() influencer: UserEntity,
    @Body('body') body: string,
    @Body('title') title: string,
  ) {
    try {
      const template = await this.service.createSmsTemplate(
        title,
        body,
        influencer,
      );
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
    @Body('title') title: string,
  ) {
    try {
      const template = await this.service.updateSmsTemplate(
        id,
        title,
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

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('template/:id')
  async getSmsTemplate(
    @LoginUser() influencer: UserEntity,
    @Param('id') id: string,
  ) {
    try {
      const templates = await this.service.findOneInTemplates({
        where: { user: influencer, id: id },
      });
      return templates;
    } catch (e) {
      throw e;
    }
  }

  //#endregion

  //#region preset
  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('preset')
  async getPreset(@LoginUser() influencer: UserEntity) {
    try {
      const templates = await this.service.getPresetMessage(influencer);
      return templates;
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('preset/triggers')
  async getPresetTriggers(@LoginUser() influencer: UserEntity) {
    try {
      return presetTrigger;
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Put('preset/:id')
  async updatePreset(
    @LoginUser() influencer: UserEntity,
    @Param('id') id: number,
    @Body() data: PresetsUpdateDto,
  ) {
    try {
      const template = await this.service.updatePresetMessage(
        id,
        data,
        influencer,
      );
      return template;
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Delete('preset/:id')
  async deletePreset(
    @LoginUser() influencer: UserEntity,
    @Param('id') id: number,
  ) {
    try {
      const template = await this.service.deletePresetMessage(id, influencer);
      return template;
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('preset')
  async setPreset(
    @LoginUser() influencer: UserEntity,
    @Body() _preset: PresetsDto,
  ) {
    try {
      const preset = await this.service.setPresetMessage(_preset, influencer);
      return preset;
    } catch (e) {
      throw e;
    }
  }

  //#endregion
}
