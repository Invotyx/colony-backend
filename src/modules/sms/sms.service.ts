import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { env } from 'process';
import { CityCountryService } from '../../services/city-country/city-country.service';
import { tagReplace } from '../../shared/tag-replace';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsEntity } from '../contacts/entities/contacts.entity';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhonesEntity } from '../phone/entities/phone.entity';
import { PhoneService } from '../phone/phone.service';
import { SubscriptionsService } from '../products/services/subscriptions.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/services/users.service';
import { presetTrigger } from './entities/preset-message.entity';
import { PresetsDto, PresetsUpdateDto } from './preset.dto';
import { ConversationsRepository } from './repo/conversation-messages.repo';
import { ConversationMessagesRepository } from './repo/conversation.repo';
import { PresetMessagesRepository } from './repo/sms-presets.repo';
import { SMSTemplatesRepository } from './repo/sms-templates.repo';

@Injectable()
export class SmsService {
  private client;
  constructor(
    public readonly smsTemplateRepo: SMSTemplatesRepository,
    public readonly presetRepo: PresetMessagesRepository,
    @Inject(forwardRef(() => ContactsService))
    public readonly contactService: ContactsService,
    public readonly phoneService: PhoneService,
    public readonly conversationsRepo: ConversationsRepository,
    public readonly conversationsMessagesRepo: ConversationMessagesRepository,
    public readonly userService: UsersService,
    public readonly subService: SubscriptionsService,
    public readonly paymentHistory: PaymentHistoryService,
    public readonly countryService: CityCountryService,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
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
      const influencerNumber = await this.phoneService.repo.findOne({
        where: { number: receiver, status: 'in-use', country: fromCountry },
        relations: ['user'],
      });

      if (influencerNumber) {
        let contact = await this.contactService.repository.findOne({
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
          const conversation = await this.conversationsRepo.findOne({
            where: { contact: contact, phone: influencerNumber },
          });
          console.log('conversation found');
          if (conversation) {
            const messages = await this.conversationsMessagesRepo.find({
              where: { conversations: conversation },
            });

            if (messages && messages.length > 0) {
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
            } else {
              console.log('conversation found but sms count is 0');
              // contact already exists but not subscribed to this influencer
              // send welcome sms
              // send profile completion sms if not completed yet
              await this.contactOnboarding(
                sender,
                influencerNumber,
                body,
                receivedAt,
                sid,
                preset_welcome,
                fromCountry,
              );
            }
          } else {
            console.log('conversation not found but contact exists');
            //contact already exists, subscribed to new influencer.
            await this.contactOnboarding(
              sender,
              influencerNumber,
              body,
              receivedAt,
              sid,
              preset_welcome,
              fromCountry,
            );
          }
        } else {
          // new contact onboarding.
          // send welcome sms
          // send profile completion sms
          console.log('new contact onboard.');
          await this.contactOnboarding(
            sender,
            influencerNumber,
            body,
            receivedAt,
            sid,
            preset_welcome,
            fromCountry,
          );
        }
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
    const plan = await this.subService.planService.repository.findOne();
    await this.paymentHistory.updateDues({
      cost: plan.subscriberCost,
      costType: 'contacts',
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
    phoneNumber: string,
  ) {
    try {
      const _contact = await this.contactService.repository.findOne({
        where: { phoneNumber: contact, user: inf },
      });
      if (_contact) {
        const _inf_phone = await this.phoneService.repo.findOne({
          where: { user: inf, number: phoneNumber },
        });
        if (_inf_phone)
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

      const plan = await this.subService.planService.repository.findOne();

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
          await this.saveSms(
            contact,
            influencerNumber,
            body,
            new Date(),
            type,
            message.sid,
            'failed',
          );
          return true;
        } else {
          await this.paymentHistory.updateDues({
            cost: country.smsCost,
            costType: 'sms',
            user: influencerNumber.user,
          });
          await this.saveSms(
            contact,
            influencerNumber,
            body,
            new Date(),
            type,
            message.sid,
            'sent',
          );
          return true;
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

  //#endregion

  //#region conversation

  async getConversations(inf: UserEntity) {
    try {
      const conversations = await this.conversationsRepo.findOne({
        where: { user: inf },
        order: { createdAt: 'DESC' },
      });
      if (conversations) {
        return conversations;
      } else {
        return { message: 'No conversations created yet.' };
      }
    } catch (e) {}
  }

  async getConversation(inf: UserEntity, contact: string) {
    try {
      const contactNumber = await this.contactService.repository.findOne({
        where: { phoneNumber: contact, user: inf },
      });
      if (contactNumber) {
        const conversation = await this.conversationsRepo.findOne({
          where: { user: inf, contact: contactNumber },
        });
        const conversationMessages = await this.conversationsMessagesRepo.find({
          where: { conversations: conversation },
          order: { createdAt: 'DESC' },
        });
        return { conversation, conversationMessages };
      } else {
        throw new BadRequestException('No such contact exists');
      }
    } catch (e) {
      throw e;
    }
  }

  async deleteConversation(inf: UserEntity, contact: string) {
    try {
      const contactNumber = await this.contactService.repository.findOne({
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
