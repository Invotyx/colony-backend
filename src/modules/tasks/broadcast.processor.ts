import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SmsService } from '../sms/sms.service';

@Processor('broadcast_q')
export class OutboundBroadcastSmsProcessor {
  private readonly logger = new Logger(OutboundBroadcastSmsProcessor.name);

  constructor(private readonly service: SmsService) {}

  @Process('broadcast_message')
  async handleBroadcastOutbound(job: Job) {
    const body = job.data;

    await this.service.sendSms(
      body.contact,
      body.phone,
      body.message,
      'broadcastOutbound',
    );
  }
}
