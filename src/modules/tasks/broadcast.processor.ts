import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';
import { BroadcastService } from '../sms/broadcast.service';
import { SmsService } from '../sms/sms.service';

@Processor('broadcast_q')
@Processor('broadcast_q_dev')
export class OutboundBroadcastSmsProcessor {
  private readonly logger = new Logger(OutboundBroadcastSmsProcessor.name);

  constructor(
    private readonly service: SmsService,
    private readonly broadcastService: BroadcastService,
    private readonly infLinksService: InfluencerLinksService,
  ) {}

  @Process('broadcast_message')
  async handleBroadcastOutbound(job: Job) {
    try {
      const body = job.data;
      ////console.log('***************************');

      const sms = await this.service.sendSms(
        body.contact,
        body.phone,
        body.message,
        'broadcastOutbound',
        null,
        body.broadcast,
      );
      ////console.log(sms, '/*/*/*/*/*/*');
      await this.broadcastService.addContactToBroadcastList(
        body.broadcast,
        body.contact,
        sms.sid,
        sms.status,
      );

      ////console.log('+++++++*/*/*+++++');
      await this.infLinksService.updateLinkStatus(
        sms.status,
        sms.sid,
        body.contact.id + ':' + body.broadcast.id,
      );
      ////console.log('***********/*/************');
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
