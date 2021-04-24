import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SmsService } from './sms.service';

@Processor('receive_sms_and_send_welcome')
export class InboundSmsProcessor {
  private readonly logger = new Logger(InboundSmsProcessor.name);

  constructor(private readonly service: SmsService) {}

  @Process('inboundSms')
  async handleInboundSms(job: Job) {
    this.logger.debug(job.data);

    const body = job.data;
    await this.service.receiveSms(
      body.sender,
      body.receiver,
      body.body,
      body.receivedAt,
    );
  }
}
