import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird';
import { env } from 'process';
import { PresetMessagesEntity } from 'src/entities/preset-message.entity';
import { UserEntity } from 'src/entities/user.entity';
import { PresetsDto, PresetsUpdateDto } from './preset.dto';
import { PresetMessagesRepository } from './repo/sms-presets.repo';
import { SMSTemplatesRepository } from './repo/sms-templates.repo';

@Injectable()
export class SmsService {
  private mb: MessageBird;
  constructor(
    public readonly smsTemplateRepo: SMSTemplatesRepository,
    public readonly presetRepo: PresetMessagesRepository
  ) {
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

  async setPresetMessage(preset:PresetsDto,user:UserEntity) {
    try {
      const existing = await this.presetRepo.findOne({ where: { user: user, trigger: preset.trigger } });
      if (!existing) {
        const _preset: any = await this.presetRepo.save({
          name: preset.name,
          body: preset.body,
          trigger: preset.trigger,
          user: user
        });
        _preset.user = _preset.user.id as any;
        return { preset: _preset };
      } else {
        throw new BadRequestException('Preset message for this trigger already exists.');
      }
    } catch (e) {
      throw e;
    }
  }

  async updatePresetMessage(id:number,preset:PresetsUpdateDto,user:UserEntity) {
    try {
      const existing = await this.presetRepo.findOne({ where: { id: id, user: user } });
      if (existing) {
        if (preset.body) {
          existing.body = preset.body;
        }
        if (preset.name) {
          existing.name = preset.name;
        }

        const _preset: any = await this.presetRepo.save(existing);
        _preset.user = user.id as any;
        return { preset: _preset, message:'Message Updated.' };
      } else {
        throw new BadRequestException('Not found.');
      }
    } catch (e) {
      throw e;
    }
  }

  async getPresetMessage(user:UserEntity) {
    try {
      const _preset = await this.presetRepo.find({ where: { user: user } });
      return { preset: _preset };
    } catch (e) {
      throw e;
    }    
  }

  async deletePresetMessage(id:number,user:UserEntity) {
    try {
      const _preset = await this.presetRepo.findOne({ where: { id: id, user: user } });
      await this.presetRepo.delete(_preset);
      return { preset: _preset, message: 'Preset message deleted.' };
    } catch (e) {
      throw e;
    }    
  }

}
