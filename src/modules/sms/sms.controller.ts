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
import { Response } from 'express';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { tagReplace } from 'src/shared/tag-replace';
import { BroadcastService } from './broadcast.service';
import { PresetsDto, PresetsUpdateDto, presetTrigger } from './preset.dto';
import { SmsService } from './sms.service';

@Controller('sms')
@ApiTags('sms')
export class SmsController {
  constructor(
    private readonly service: SmsService,
    private readonly broadcastService: BroadcastService,
  ) {}

  @Post('receive-sms/webhook')
  @HttpCode(200)
  async receiveSms(@Body() body: any, @Res() res: Response) {
    try {
      console.log(body);
      await this.service.receiveSms(
        body.sender,
        body.receiver,
        body.body,
        body.receivedAt,
      );

      return;
    } catch (e) {
      throw e;
    }
  }

  //#region  conversation
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
  @Post('/conversation/:contact')
  async sendSms(
    @LoginUser() inf: UserEntity,
    @Param('contact') contact: string,
    @Body('message') message: string,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    try {
      const _contact = await this.service.contactService.repository.findOne({
        where: { phoneNumber: contact, user: inf },
      });
      if (_contact) {
        const _inf_phone = await this.service.phoneService.repo.findOne({
          where: { user: inf, number: phoneNumber },
        });
        if (_inf_phone)
          await this.service.sendSms(
            _contact,
            _inf_phone,
            tagReplace(message, {
              name: _contact.name,
              inf_name:
                _inf_phone.user.firstName + ' ' + _inf_phone.user.firstName,
            }),
            'outBound',
          );
      }
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
