import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BroadcastService } from './broadcast.service';
import { SmsService } from './sms.service';

@Processor('outbound_status_callback')
export class OutboundCallbackSmsProcessor {
  private readonly logger = new Logger(OutboundCallbackSmsProcessor.name);

  constructor(
    private readonly service: SmsService,
    private readonly bcService: BroadcastService,
  ) {}

  @Process('outBoundSmsStatus')
  async handleOutboundSmsStatus(job: Job) {
    const body = job.data;
    //console.log(body);
    if (
      body.MessageStatus == 'delivered' ||
      body.MessageStatus == 'undelivered' ||
      body.MessageStatus == 'failed' ||
      body.MessageStatus == 'sent'
    ) {
      //
      await this.service.updateStatus(
        body.MessageSid,
        body.MessageStatus,
        body.From,
      );
      await this.bcService.updateStatus(
        body.MessageSid,
        body.MessageStatus,
        body.From,
      );
    }
    this.logger.debug(job.data);
  }
}
