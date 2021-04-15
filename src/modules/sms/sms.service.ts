import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird';
import { env } from 'process';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { PhonesEntity } from 'src/entities/phone.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ContactsService } from '../contacts/contacts.service';
import { PhoneService } from '../phone/phone.service';
import { PresetsDto, PresetsUpdateDto } from './preset.dto';
import { ConversationsRepository } from './repo/conversation-messages.repo';
import { ConversationMessagesRepository } from './repo/conversation.repo';
import { PresetMessagesRepository } from './repo/sms-presets.repo';
import { SMSTemplatesRepository } from './repo/sms-templates.repo';

@Injectable()
export class SmsService {
  private mb: MessageBird;
  constructor(
    public readonly smsTemplateRepo: SMSTemplatesRepository,
    public readonly presetRepo: PresetMessagesRepository,
    public readonly contactService: ContactsService,
    public readonly phoneService: PhoneService,
    public readonly conversationsRepo: ConversationsRepository,
    public readonly conversationsMessagesRepo: ConversationMessagesRepository,
  ) {
    console.log(env.MESSAGEBIRD_KEY);
    this.mb = require('messagebird')(env.MESSAGEBIRD_KEY);
  }

  async receiveSms(
    sender: string,
    receiver: string,
    body: string,
    receivedAt: Date,
  ) {
    try {
      const influencerNumber = await this.phoneService.repo.findOne({
        where: { number: receiver, status: 'active' },
      });
      const contact = await this.contactService.repository.findOne({
        where: { phoneNumber: sender },
      });

      if (contact) {
        const rel = await this.contactService.influencerContactRepo.findOne({
          where: { contact: contact, user: influencerNumber.user },
        });
        if (rel) {
          await this.saveSms(
            contact,
            influencerNumber,
            body,
            receivedAt,
            'inBound',
          );
        } else {
          // send welcome sms
          // send profile completion sms if not completed yet

          await this.contactService.addContact(
            sender,
            influencerNumber.user.id,
          );
          await this.saveSms(
            contact,
            influencerNumber,
            body,
            receivedAt,
            'inBound',
          );
        }
      } else {
        // send welcome sms
        // send profile completion sms

        await this.contactService.addContact(sender, influencerNumber.user.id);
        await this.saveSms(
          contact,
          influencerNumber,
          body,
          receivedAt,
          'inBound',
        );
      }
    } catch (e) {
      throw e;
    }
  }

  async saveSms(
    contact: ContactsEntity,
    influencerPhone: PhonesEntity,
    body: string,
    receivedAt: Date,
    type: string,
  ) {
    //create conversation if not created yet.
    //add sms to conversation
    let conversation = await this.conversationsRepo.findOne({
      where: { contact: contact, phone: influencerPhone },
    });
    let message;
    if (conversation) {
      message = await this.conversationsMessagesRepo.save({
        conversations: conversation,
        sms: body,
        status: '',
        type: type,
        receivedAt: receivedAt,
      });

      conversation.isActive = true;
      await this.conversationsRepo.save(conversation);
    } else {
      conversation = await this.conversationsRepo.save({
        contact: contact,
        phone: influencerPhone,
        isActive: type == 'broadcast' ? false : true,
      });
      message = await this.conversationsMessagesRepo.save({
        conversations: conversation,
        sms: body,
        status: '',
        type: type,
        receivedAt: receivedAt,
      });
    }
    return message;
  }

  async sendSms(
    contact: ContactsEntity,
    influencerNumber: PhonesEntity,
    body: string,
    type: string,
  ) {
    const sms = this.mb.messages;
    //parse sms here to fill in details.
    sms.create(
      {
        body: body,
        recipients: [contact.phoneNumber], //recipient(s)
        type: 'sms',
        originator: influencerNumber.number, //sender
      },
      this.smsCallback,
    );

    await this.saveSms(contact, influencerNumber, body, new Date(), type);
  }

  private smsCallback = (error, res) => {
    if (error) {
      //failure case
    } else {
      //save sms here.

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

  async setPresetMessage(preset: PresetsDto, user: UserEntity) {
    try {
      const existing = await this.presetRepo.findOne({
        where: { user: user, trigger: preset.trigger },
      });
      if (!existing) {
        const _preset: any = await this.presetRepo.save({
          name: preset.name,
          body: preset.body,
          trigger: preset.trigger,
          user: user,
        });
        _preset.user = _preset.user.id as any;
        return { preset: _preset };
      } else {
        throw new BadRequestException(
          'Preset message for this trigger already exists.',
        );
      }
    } catch (e) {
      throw e;
    }
  }

  async updatePresetMessage(
    id: number,
    preset: PresetsUpdateDto,
    user: UserEntity,
  ) {
    try {
      const existing = await this.presetRepo.findOne({
        where: { id: id, user: user },
      });
      if (existing) {
        if (preset.body) {
          existing.body = preset.body;
        }
        if (preset.name) {
          existing.name = preset.name;
        }

        const _preset: any = await this.presetRepo.save(existing);
        _preset.user = user.id as any;
        return { preset: _preset, message: 'Message Updated.' };
      } else {
        throw new BadRequestException('Not found.');
      }
    } catch (e) {
      throw e;
    }
  }

  async getPresetMessage(user: UserEntity) {
    try {
      const _preset = await this.presetRepo.find({ where: { user: user } });
      return { preset: _preset };
    } catch (e) {
      throw e;
    }
  }

  async deletePresetMessage(id: number, user: UserEntity) {
    try {
      const _preset = await this.presetRepo.findOne({
        where: { id: id, user: user },
      });
      await this.presetRepo.delete(_preset);
      return { preset: _preset, message: 'Preset message deleted.' };
    } catch (e) {
      throw e;
    }
  }
}
