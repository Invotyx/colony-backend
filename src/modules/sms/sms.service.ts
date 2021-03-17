import { Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird';
import { env } from 'process';
import { UserEntity } from 'src/entities/user.entity';
import { SMSTemplatesRepository } from './repo/sms-templates.repo';

@Injectable()
export class SmsService {
  private mb: MessageBird;
  constructor(public readonly smsTemplateRepo: SMSTemplatesRepository) {
    console.log(env.MESSAGEBIRD_KEY);
    this.mb = require('messagebird')(env.MESSAGEBIRD_KEY);
  }

  async sendSms() {
    const sms = this.mb.messages;
    sms.create(
      {
        body: '',
        recipients: [''], //recipient(s)
        type: 'sms',
        originator: '', //sender
      },
      this.smsCallback,
    );
  }

  private smsCallback = (error, res) => {
    if (error) {
      //failure case
    } else {
      //success scenario
      return res;
    }
  };

  async createSmsTemplate(body: string, influencer: UserEntity) {
    try {
      const template = await this.smsTemplateRepo.save({
        body: body,
        user: influencer,
      });
      template.user = template.user.id as any;
      return { template, message: 'Template saved.' };
    } catch (e) {
      throw e;
    }
  }

  async updateSmsTemplate(id: number, body: string, influencer: UserEntity) {
    try {
      const template = await this.smsTemplateRepo.findOne({
        where: { id: id, user: influencer },
      });
      if (template) {
        template.body = body;
        await this.smsTemplateRepo.save(template);
      } else {
        return { message: 'Template does not exist.' };
      }
      return { template, message: 'Template updated.' };
    } catch (e) {
      throw e;
    }
  }

  async deleteSmsTemplate(id: number) {
    try {
      const template = await this.smsTemplateRepo.softDelete(id);
      return { template, message: 'Template deleted.' };
    } catch (e) {
      throw e;
    }
  }

  async getSmsTemplates(inf: UserEntity) {
    try {
      const templates = await this.smsTemplateRepo.find({
        where: { user: inf },
      });
      return { templates: templates };
    } catch (e) {
      throw e;
    }
  }
}
