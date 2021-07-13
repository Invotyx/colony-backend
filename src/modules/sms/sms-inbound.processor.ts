import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BroadcastService } from './broadcast.service';
import { Tone } from './sms-tone.class';
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

    const tones = JSON.parse(body.AddOns);
    console.log('tones', tones);
    let emotions = tones.results.result.document_tone.tone_categories;
    let _emotion: Tone[];
    emotions.forEach((emotion) => {
      if (emotion.category_id == 'emotion_tone') {
        _emotion = emotion.tones;
      }
    });

    console.log('_emotion', _emotion);

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
