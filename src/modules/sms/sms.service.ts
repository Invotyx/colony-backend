import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Queue } from 'bull';
import { env } from 'process';
import { CityCountryService } from '../../services/city-country/city-country.service';
import { tagReplace } from '../../shared/tag-replace';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsEntity } from '../contacts/entities/contacts.entity';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhonesEntity } from '../phone/entities/phone.entity';
import { PhoneService } from '../phone/phone.service';
import { SubscriptionsService } from '../products/subscription/subscriptions.service';
import { UserEntity } from '../users/entities/user.entity';
import { PresetsDto, PresetsUpdateDto } from './dtos/preset.dto';
import { presetTrigger } from './entities/preset-message.entity';
import { ConversationsRepository } from './repo/conversation-messages.repo';
import { ConversationMessagesRepository } from './repo/conversation.repo';
import { PresetMessagesRepository } from './repo/sms-presets.repo';
import { SMSTemplatesRepository } from './repo/sms-templates.repo';

@Injectable()
export class SmsService {
  private client;
  constructor(
    private readonly smsTemplateRepo: SMSTemplatesRepository,
    private readonly presetRepo: PresetMessagesRepository,
    @Inject(forwardRef(() => ContactsService))
    private readonly contactService: ContactsService,
    private readonly phoneService: PhoneService,
    private readonly conversationsRepo: ConversationsRepository,
    private readonly conversationsMessagesRepo: ConversationMessagesRepository,
    private readonly subService: SubscriptionsService,
    private readonly paymentHistory: PaymentHistoryService,
    private readonly countryService: CityCountryService,
    @InjectQueue('sms_q') private readonly queue: Queue,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
  }

  public async findOneInTemplates(condition?: any) {
    if (condition) return this.smsTemplateRepo.findOne(condition);
    else return this.smsTemplateRepo.findOne();
  }

  public async findOneInPreSets(condition?: any) {
    if (condition) return this.presetRepo.findOne(condition);
    else return this.presetRepo.findOne();
  }

  public async findInPreSets(condition?: any) {
    if (condition) return this.presetRepo.find(condition);
    else return this.presetRepo.find();
  }

  public async findOneConversations(condition?: any) {
    if (condition) return this.conversationsRepo.findOne(condition);
    else return this.conversationsRepo.findOne();
  }

  public async findConversations(condition?: any) {
    if (condition) return this.conversationsRepo.find(condition);
    else return this.conversationsRepo.find();
  }
  public async findOneConversationsMessages(condition?: any) {
    if (condition) return this.conversationsMessagesRepo.findOne(condition);
    else return this.conversationsMessagesRepo.findOne();
  }

  public async findConversationsMessages(condition?: any) {
    if (condition) return this.conversationsMessagesRepo.find(condition);
    else return this.conversationsMessagesRepo.find();
  }

  //#region sms
  async receiveSms(
    sender: string,
    receiver: string,
    body: string,
    receivedAt: Date,
    sid: string,
    fromCountry: string,
  ) {
    try {
      const influencerNumber = await this.phoneService.findOne({
        where: { number: receiver, status: 'in-use', country: fromCountry },
        relations: ['user'],
      });
      if (influencerNumber) {
        const contact = await this.contactService.findOne({
          where: { phoneNumber: sender },
        });

        let preset_welcome: any = await this.presetRepo.findOne({
          where: { trigger: 'welcome', user: influencerNumber.user },
        });

        if (!preset_welcome) {
          preset_welcome = {
            body: 'Welcome from ${inf_name}.',
          };
        }
        if (contact) {
          const rel = await this.contactService.checkRelation(
            influencerNumber.user.id,
            contact.id,
          );

          const conversation = await this.conversationsRepo.findOne({
            where: { contact: contact, phone: influencerNumber },
          });

          if (rel && conversation) {
            console.log('conversation found');
            await this.saveSms(
              contact,
              influencerNumber,
              body,
              receivedAt,
              'inBound',
              sid,
            );
            console.log('saved as regular inbound sms');
            //this is just a normal sms
            return 200;
          }
        }
        await this.contactOnboarding(
          sender,
          influencerNumber,
          body,
          receivedAt,
          sid,
          preset_welcome,
          fromCountry,
        );
        return 200;
      } else {
        console.log(
          'Influencer not found. Error generated. Returned 200 to twillio hook.',
        );
        return 200;
      }
    } catch (e) {
      console.log('Receive SMS', e);
      throw e;
    }
  }

  private async contactOnboarding(
    sender,
    influencerNumber,
    body,
    receivedAt,
    sid,
    preset_welcome,
    fromCountry,
  ) {
    let contact = await this.contactService.addContact(
      sender,
      influencerNumber.user.id,
      fromCountry,
    );
    await this.saveSms(
      contact,
      influencerNumber,
      body,
      receivedAt,
      'inBound',
      sid,
      'received',
    );
    console.log('in bound sms saved');
    const plan = await this.subService.planService.findOne();
    await this.paymentHistory.updateDues({
      cost: plan.subscriberCost,
      type: 'contacts',
      user: influencerNumber.user,
    });
    console.log('subscription log added to dues');
    await this.sendSms(
      contact,
      influencerNumber,
      tagReplace(preset_welcome.body, {
        name: contact.name ? contact.name : '',
        inf_name:
          influencerNumber.user.firstName +
          ' ' +
          influencerNumber.user.lastName,
        link:
          env.PUBLIC_APP_URL +
          '/contacts/enroll/' +
          influencerNumber.user.id +
          ':::' +
          contact.urlMapper +
          ':::' +
          influencerNumber.id,
      }),
      'outBound',
    );
    console.log('outbound sms sent');
  }

  async saveSms(
    contact: ContactsEntity,
    influencerPhone: PhonesEntity,
    body: string,
    receivedAt: Date,
    type: string,
    sid: string,
    status?: string,
  ) {
    //create conversation if not created yet.
    //add sms to conversation
    let conversation = await this.conversationsRepo.findOne({
      where: { contact: contact, user: influencerPhone.user },
    });
    let message;
    if (conversation) {
      message = await this.conversationsMessagesRepo.save({
        conversations: conversation,
        sms: body,
        status: '',
        type: type,
        receivedAt: receivedAt,
        sid: sid,
      });

      conversation.isActive = true;
      await this.conversationsRepo.save(conversation);
    } else {
      conversation = await this.conversationsRepo.save({
        contact: contact,
        phone: influencerPhone,
        isActive: type == 'broadcast' ? false : true,
        user: influencerPhone.user,
      });
      message = await this.conversationsMessagesRepo.save({
        conversations: conversation,
        sms: body,
        status: '',
        type: type,
        receivedAt: receivedAt,
        sid: sid,
      });
    }
    return message;
  }

  async initiateSendSms(
    inf: UserEntity,
    contact: string,
    message: string,
    scheduled?: Date,
  ) {
    try {
      const _contact = await this.contactService.findOne({
        where: { phoneNumber: contact, user: inf },
      });
      if (_contact) {
        const conversation = await this.conversationsRepo.findOne({
          where: { contact: _contact, user: inf },
          relations: ['user', 'contact', 'phone'],
        });

        let _inf_phone = conversation.phone;
        if (_inf_phone && _inf_phone.status != 'in-use') {
          const __inf_phone = await this.phoneService.findOne({
            where: { user: inf, country: _contact.cCode, status: 'in-use' },
          });
          if (__inf_phone) {
            _inf_phone = __inf_phone;
          } else {
            throw new BadRequestException(
              'You do not have any number associated to your account to send sms to this country',
            );
          }
        }
        if (_inf_phone)
          if (scheduled) {
            //handle schedule here
            const q_obj = {
              contact: _contact,
              inf_phone: _inf_phone,
              message: tagReplace(message, {
                name: _contact.name,
                inf_name:
                  _inf_phone.user.firstName + ' ' + _inf_phone.user.firstName,
              }),
              type: 'outBound',
            };
            await this.queue.add('scheduled_message', q_obj, {
              removeOnComplete: true,
              removeOnFail: true,
              attempts: 2,
              delay: 1000,
            });
            return;
          }
        await this.sendSms(
          _contact,
          _inf_phone,
          tagReplace(message, {
            name: _contact.name,
            inf_name:
              _inf_phone.user.firstName + ' ' + _inf_phone.user.firstName,
          }),
          'outBound',
        );
      } else {
        throw new BadRequestException(
          'You cannot send message to contact who has not subscribed you yet.',
        );
      }
    } catch (e) {
      throw e;
    }
  }
  async sendSms(
    contact: ContactsEntity,
    influencerNumber: PhonesEntity,
    body: string,
    type: string,
  ) {
    try {
      const checkThreshold = await this.paymentHistory.getDues(
        'sms',
        influencerNumber.user,
      );

      const country = await this.countryService.countryRepo.findOne({
        where: { code: influencerNumber.country },
      });

      const plan = await this.subService.planService.findOne();

      if (
        !checkThreshold ||
        checkThreshold.cost + country.smsCost < plan.threshold
      ) {
        const message = await this.client.messages.create({
          body: body,
          to: contact.phoneNumber, //recipient(s)
          from: influencerNumber.number,
        });

        if (message.status != 'sent') {
          //failure case
          return this.saveSms(
            contact,
            influencerNumber,
            body,
            new Date(),
            type,
            message.sid,
            message.status,
          );
        } else {
          await this.paymentHistory.updateDues({
            cost: country.smsCost,
            type: 'sms',
            user: influencerNumber.user,
          });
          return this.saveSms(
            contact,
            influencerNumber,
            body,
            new Date(),
            type,
            message.sid,
            'sent',
          );
          //success scenario
        }
      } else {
        console.log('Threshold reached');
        throw new BadRequestException(
          'Threshold value reached. Expedite your due payments.',
        );
      }
    } catch (e) {
      console.error('sendSms', e);
      throw e;
    }
  }

  public async updateStatus(sid: string, status: string, from: string) {
    try {
      const bc = await this.conversationsMessagesRepo.findOne({
        where: { smsSid: sid },
      });

      const influencerNumber = await this.phoneService.findOne({
        where: { number: from },
      });
      const country = await this.countryService.countryRepo.findOne({
        where: { code: influencerNumber.country },
      });

      if (bc.status != 'sent' && status == 'sent') {
        await this.paymentHistory.updateDues({
          cost: country.smsCost,
          type: 'sms',
          user: influencerNumber.user,
        });
      }
      bc.status = status;
      return this.conversationsMessagesRepo.save(bc);
    } catch (e) {
      throw e;
    }
  }
  //#endregion

  //#region conversation

  async getConversations(
    inf: UserEntity,
    count: number = 100,
    page: number = 1,
  ) {
    try {
      const conversations = await this.conversationsRepo.find({
        where: { user: inf },
        order: { updatedAt: 'DESC' },
        relations: ['phone', 'contact', 'user'],
        take: count,
        skip: count * page - count,
      });

      if (conversations.length > 0) {
        return conversations;
      } else {
        return [];
      }
    } catch (e) {
      throw e;
    }
  }

  async getConversation(
    inf: UserEntity,
    conversationId: string,
    count: number = 100,
    page: number = 1,
  ) {
    try {
      const conversation = await this.conversationsRepo.findOne({
        where: { user: inf, id: conversationId },
        relations: ['phone', 'contact'],
      });
      const conversationMessage = await this.conversationsMessagesRepo.find({
        where: {
          conversations: conversation,
        },
        order: { createdAt: 'DESC' },
        take: count,
        skip: count * page - count,
      });
      if (conversation) return conversationMessage;
      throw new BadRequestException('No messages found.');
    } catch (e) {
      throw e;
    }
  }

  async deleteConversation(inf: UserEntity, contact: string) {
    try {
      const contactNumber = await this.contactService.findOne({
        where: { phoneNumber: contact, user: inf },
      });
      if (contactNumber) {
        const conversation = await this.conversationsRepo.findOne({
          where: { user: inf, contact: contactNumber },
        });
        await this.conversationsMessagesRepo.softDelete({
          conversations: conversation,
        });
        await this.conversationsRepo.softDelete(conversation);
        return { message: 'Conversation with all its messages deleted.' };
      } else {
        throw new BadRequestException('No such contact exists');
      }
    } catch (e) {
      throw e;
    }
  }

  async deleteMessage(smsId: any) {
    try {
      await this.conversationsMessagesRepo.softDelete({
        id: smsId,
      });
      return { message: 'Sms deleted.' };
    } catch (e) {
      throw e;
    }
  }

  //#endregion

  //#region  sms templates
  async createSmsTemplate(title: string, body: string, influencer: UserEntity) {
    try {
      const template = await this.smsTemplateRepo.save({
        body: body,
        title: title,
        user: influencer,
      });
      template.user = template.user.id as any;
      return { template, message: 'Template saved.' };
    } catch (e) {
      throw e;
    }
  }

  async updateSmsTemplate(
    id: number,
    title: string,
    body: string,
    influencer: UserEntity,
  ) {
    try {
      const template = await this.smsTemplateRepo.findOne({
        where: { id: id, user: influencer },
      });
      if (template) {
        template.body = body;
        template.title = title;
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

  //#endregion

  //#region  preset messages
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
      let _preset = await this.presetRepo.find({ where: { user: user } });
      if (!_preset || _preset.length == 0) {
        await this.presetRepo.save({
          body:
            'Hi, You have subscribed to ${inf_name}. Please complete your profile using this link ${link}',
          name: 'Welcome',
          trigger: presetTrigger.welcome,
          user: user,
        });
        await this.presetRepo.save({
          body:
            'Welcome ${name}! Glad to have you onboard.  Regards ${inf_name}. ',
          name: 'OnBoard',
          trigger: presetTrigger.onBoard,
          user: user,
        });

        await this.presetRepo.save({
          body:
            'Hi! This is ${inf_name}. You recently sent an sms to my number. Please complete your profile using this link ${link} so that I can get to know my fans better!',
          name: 'NoResponse',
          trigger: presetTrigger.noResponse,
          user: user,
        });
        _preset = await this.presetRepo.find({
          where: { user: user },
          order: { createdAt: 'ASC' },
        });
      }
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

  //#endregion
}
