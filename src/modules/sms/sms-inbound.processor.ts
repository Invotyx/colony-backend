import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BroadcastService } from './broadcast.service';
import { SmsService } from './sms.service';

@Processor('receive_sms_and_send_welcome')
export class InboundSmsProcessor {
  private readonly logger = new Logger(InboundSmsProcessor.name);

  constructor(
    private readonly service: SmsService,
    private readonly bcService: BroadcastService,
  ) {}

  @Process('inboundSms')
  async handleInboundSms(job: Job) {
    const body = job.data;

    console.log(JSON.parse(body.AddOns));
    await this.service.receiveSms(
      body.From,
      body.To,
      body.Body,
      new Date(),
      body.MessageSid,
      body.FromCountry,
    );
  }
}
