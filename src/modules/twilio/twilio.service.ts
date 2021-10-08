import { Injectable, Logger } from '@nestjs/common';
import { env } from 'process';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
    private readonly logger = new Logger('TwilioService');
    private client: twilio.Twilio;
    constructor() {
        this.client = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN,
            {
                lazyLoading: true,
            },
        );
    }

  async sendCodeToUser(userNumber: string): Promise<any> {
    const verificationToken = env.VERIFICATION_SID;
    return this.client.verify
      .services(verificationToken)
      .verifications.create({ to: userNumber, channel: 'sms' });
  }

  async verifyUserCode(userNumber: string, code_: string): Promise<any> {
    const verificationToken = env.VERIFICATION_SID;
    return this.client.verify
      .services(verificationToken)
      .verificationChecks.create({ to: userNumber, code: code_ });
  }
}
