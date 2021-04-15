import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { PresetsDto, PresetsUpdateDto, presetTrigger } from './preset.dto';
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

  @Post('receive-sms/webhook')
  @HttpCode(200)
  async receiveSms(@Body() body: any) {
    try {
      await this.service.receiveSms(
        body.sender,
        body.receiver,
        body.body,
        body.receivedAt,
      );
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
}
