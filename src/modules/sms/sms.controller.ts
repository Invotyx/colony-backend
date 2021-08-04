import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { Response } from 'express';
import { env } from 'process';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { PaginationDto } from '../contacts/contact.dto';
import { ContactsService } from '../contacts/contacts.service';
import { UserEntity } from '../users/entities/user.entity';
import { BroadcastService } from './broadcast.service';
import { BroadcastDto } from './dtos/broadcast.dto';
import { PresetsDto, PresetsUpdateDto, presetTrigger } from './dtos/preset.dto';
import { SmsService } from './sms.service';

@Controller('sms')
@ApiTags('sms')
export class SmsController {
  constructor(
    private readonly service: SmsService,
    private readonly broadcastService: BroadcastService,
    private readonly contactService: ContactsService,
    @InjectQueue('receive_sms_and_send_welcome') private readonly queue: Queue,
    @InjectQueue('outbound_status_callback')
    private readonly obCallbackQ: Queue,
    @InjectQueue('receive_sms_and_send_welcome_dev')
    private readonly queue_dev: Queue,
    @InjectQueue('outbound_status_callback_dev')
    private readonly obCallbackQ_dev: Queue,
  ) {}

  @Post('receive-sms/webhook')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async receiveSms(@Body() body: any, @Res() res: Response) {
    try {
      if (env.NODE_ENV.toLowerCase() == 'production') {
        await this.queue.add('inboundSms', body, {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1,
        });
      } else {
        await this.queue_dev.add('inboundSms', body, {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1,
        });
      }
      return '<Response></Response>';
    } catch (e) {
      //console.log('receiveSms/webhook', e);
      return '<Response></Response>';
    }
  }

  @Post('receive-sms-status-callback/webhook')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async receiveSmsStatusCallback(@Body() body: any, @Res() res: Response) {
    try {
      //add checks here to write to Queue
      if (env.NODE_ENV.toLowerCase() == 'production') {
        await this.obCallbackQ.add('outBoundSmsStatus', body, {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1,
        });
      } else {
        await this.obCallbackQ_dev.add('outBoundSmsStatus', body, {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1,
        });
      }
      return '<Response></Response>';
    } catch (e) {
      //console.log('-callback/webhook', e);
      return '<Response></Response>';
    }
  }

  //#region  conversation
  @Auth({})
  @Get('/conversations')
  async getConversations(
    @LoginUser() inf: UserEntity,
    @Query() data?: PaginationDto,
  ) {
    try {
      return this.service.getConversations(inf, data.perPage, data.page);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('/conversation/:conversationId')
  async getConversation(
    @LoginUser() inf: UserEntity,
    @Param('conversationId') conversationId: string,
    @Query() data?: PaginationDto,
  ) {
    try {
      return this.service.getConversation(
        inf,
        conversationId,
        data.perPage,
        data.page,
      );
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('/conversations/search')
  async search(@LoginUser() user: UserEntity, @Query('query') query: string) {
    return this.service.search(user, query);
  }

  @Auth({})
  @Delete('/conversation/:contact')
  async deleteConversation(
    @LoginUser() inf: UserEntity,
    @Param('contact') contact: string,
  ) {
    try {
      return this.service.deleteConversation(inf, contact);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Delete('/conversation/sms/:smsId')
  async deleteSms(@LoginUser() inf: UserEntity, @Param('smsId') smsId: string) {
    try {
      return this.service.deleteMessage(smsId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Post('/conversation')
  async sendSms(
    @LoginUser() inf: UserEntity,
    @Body('to') contact: any,
    @Body('message') message: string,
    @Body('scheduled') scheduled?: any,
  ) {
    try {
      //console.log('SendSms start controller ****************** ');
      //console.log('to: ', contact);
      //console.log('message: ', message);
      //console.log('scheduled: ', scheduled);
      //console.log('Initiate SendSms Start *********************');

      if (Array.isArray(contact)) {
        contact.forEach(async (con) => {
          await this.service.initiateSendSms(
            inf,
            con,
            message,
            scheduled ? scheduled : null,
          );
        });
        return { message: 'Messages sent' };
      }
      return this.service.initiateSendSms(
        inf,
        contact,
        message,
        scheduled ? scheduled : null,
      );
    } catch (e) {
      throw e;
    }
  }
  //#endregion

  //#region broadcast

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('broadcast/latest')
  async getBroadcastLatestStatistics(@LoginUser() user: UserEntity) {
    try {
      return this.broadcastService.getBroadcastLatestStatistics(user);
    } catch (e) {
      throw e;
    }
  }
  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('broadcast/:id')
  async getBroadcastStatistics(
    @LoginUser() user: UserEntity,
    @Param('id') id: number,
  ) {
    try {
      return this.broadcastService.getBroadcastStatistics(id, user);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('broadcast/:id/reschedule/:filter')
  async reschedule(
    @LoginUser() user: UserEntity,
    @Param('id') id: number,
    @Param('filter') filter: string,
  ) {
    try {
      return this.broadcastService.reschedule(id, filter);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('broadcast/:id/stats/:filter')
  async getBroadcastStats(
    @LoginUser() user: UserEntity,
    @Param('id') id: number,
    @Param('filter') filter: string,
  ) {
    try {
      return this.broadcastService.getBroadcastStats(user, id, filter);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('broadcast')
  async createBroadcast(
    @LoginUser() user: UserEntity,
    @Body() broadcast: BroadcastDto,
  ) {
    try {
      const b = await this.broadcastService.createBroadcast(
        user,
        broadcast.filters,
        broadcast.name,
        broadcast.body,
        broadcast.scheduled,
      );
      b.user = b.user.id as any;
      const contacts = await this.contactService.filterContacts(
        user.id,
        broadcast.filters,
      );
      return { broadcast: b, contacts: contacts };
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('broadcast/:id/contacts')
  async getBroadcastContacts(
    @LoginUser() user: UserEntity,
    @Param('id') id: number,
  ) {
    try {
      const b = await this.broadcastService.getBroadcastContacts(user, id);
      return { broadcast: b };
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('broadcasts')
  async getBroadcasts(
    @LoginUser() user: UserEntity,
    @Query() data: PaginationDto,
  ) {
    try {
      return this.broadcastService.getBroadcasts(user, data.perPage, data.page);
    } catch (e) {
      throw e;
    }
  }

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
      return this.service.createSmsTemplate(title, body, influencer);
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
      return this.service.updateSmsTemplate(id, title, body, influencer);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Delete('template/:id/delete')
  async deleteSmsTemplate(@Param('id') id: number) {
    try {
      return this.service.deleteSmsTemplate(id);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('template')
  async getSmsTemplates(@LoginUser() influencer: UserEntity) {
    try {
      return this.service.getSmsTemplates(influencer);
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
      return this.service.findOneInTemplates({
        where: { user: influencer, id: id },
      });
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

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('activity')
  async smsActivity(@LoginUser() influencer: UserEntity) {
    return this.service.smsActivity(influencer);
  }
  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('popularity')
  async popularity(@LoginUser() influencer: UserEntity) {
    return this.service.popularity(influencer);
  }
}
