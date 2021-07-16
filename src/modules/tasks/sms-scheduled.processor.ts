import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SmsService } from '../sms/sms.service';

@Processor('sms_q')
export class ScheduledSmsProcessor {
  private readonly logger = new Logger(ScheduledSmsProcessor.name);

  constructor(private readonly service: SmsService) {}

  @Process('scheduled_message')
  async handleScheduledSms(job: Job) {
    const body = job.data;
    this.logger.log('scheduled_sms queue process:', body);
    await this.service.sendSms(
      body.contact,
      body.inf_phone,
      body.id,
      body.type,
      'scheduled',
    );
  }
}
