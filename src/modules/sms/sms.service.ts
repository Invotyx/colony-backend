import { Injectable } from '@nestjs/common';
import initMB, { MessageBird } from 'messagebird';
import { env } from 'process';

@Injectable()
export class SmsService {

  private mb: MessageBird;
  constructor() {
    console.log(env.MESSAGEBIRD_KEY)
    this.mb = require('messagebird')(env.MESSAGEBIRD_KEY);
  }

  async sendSms() {
    
    const sms = this.mb.messages;
    sms.create({
      body: "",
      recipients: [''], //recipient(s)
      type: 'sms',
      originator: '' //sender
    }, this.smsCallback);

  }

  private smsCallback = (error, res) => {
    if (error) {
      //failure case
    } else {
      //success scenario
    }
  }

}
