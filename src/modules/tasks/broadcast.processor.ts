import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';
import { BroadcastService } from '../sms/broadcast.service';
import { SmsService } from '../sms/sms.service';

@Processor('broadcast_q')
export class OutboundBroadcastSmsProcessor {
  private readonly logger = new Logger(OutboundBroadcastSmsProcessor.name);

  constructor(
    private readonly service: SmsService,
    private readonly broadcastService: BroadcastService,
    private readonly infLinksService: InfluencerLinksService,
  ) {}

  @Process('broadcast_message')
  async handleBroadcastOutbound(job: Job) {
    const body = job.data;

    this.logger.log("processing broadcast queue:",body)
    const sms = await this.service.sendSms(
      body.contact,
      body.phone,
      body.message,
      'broadcastOutbound',
    );

    await this.broadcastService.addContactToBroadcastList(
      body.broadcast,
      body.contact,
      sms.sid,
      sms.status,
    );

    await this.infLinksService.updateLinkStatus(
      body.contact.id + ':' + body.broadcast.id,
      sms.status,
      sms.sid,
    );
  }
}
