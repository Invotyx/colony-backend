import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { delay } from 'rxjs/operators';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { PhonesEntity } from 'src/entities/phone.entity';
import { presetTrigger } from 'src/entities/preset-message.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { logger } from 'src/services/logs/log.storage';
import { tagReplace } from 'src/shared/tag-replace';
import { ContactsService } from '../contacts/contacts.service';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhoneService } from '../phone/phone.service';
import { SubscriptionsService } from '../products/services/subscriptions.service';
import { UsersService } from '../users/services/users.service';
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
  ) {
    try {
      console.log(sender,receiver,body,receivedAt,sid);
      const influencerNumber = await this.phoneService.repo.findOne({
        where: { number: receiver, status: 'active' },
        relations: ['user'],
      });
      console.log(influencerNumber);
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
              sid,
            );
            //this is just a normal sms
          } else {
            // contact already exists but not subscribed to this influencer
            // send welcome sms
            // send profile completion sms if not completed yet

            contact = await this.contactService.addContact(
              sender,
              influencerNumber.user.id,
            );

            const plan = await this.subService.planService.repository.findOne();
            await this.paymentHistory.updateDues({
              cost: plan.subscriberCost,
              costType: 'contacts',
              user: influencerNumber.user,
            });

            await this.saveSms(
              contact,
              influencerNumber,
              body,
              receivedAt,
              'inBound',
              sid,
            );

            await this.sendSms(
              contact,
              influencerNumber,
              tagReplace(preset_welcome.body, {
                name: contact.name ? contact.name : '',
                inf_name:
                  influencerNumber.user.firstName +
                  ' ' +
                  influencerNumber.user.firstName,
                link:
                  env.PUBLIC_APP_URL + '/contacts/enroll/' + contact.urlMapper,
              }),
              'outBound',
            );
          }
        } else {
          // new contact onboarding.
          // send welcome sms
          // send profile completion sms

          contact = await this.contactService.addContact(
            sender,
            influencerNumber.user.id,
          );
          await this.saveSms(
            contact,
            influencerNumber,
            body,
            receivedAt,
            'inBound',
            sid,
          );

          await this.sendSms(
            contact,
            influencerNumber,
            tagReplace(preset_welcome.body, {
              name: contact.name ? contact.name : '',
              inf_name:
                influencerNumber.user.firstName +
                ' ' +
                influencerNumber.user.firstName,
              link:
                env.PUBLIC_APP_URL + '/contacts/enroll/' + contact.urlMapper,
            }),
            'outBound',
          );
        }
      } else {
        logger.error(
          'Influencer not found. Error generated. Returned 200 to twillio hook.',
        );
        return 200;
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

  async sendSms(
    contact: ContactsEntity,
    influencerNumber: PhonesEntity,
    body: string,
    type: string,
  ) {
    try {
      const sms = await this.client.messages;
      //parse sms here to fill in details.
      console.log('=================outbound', body, type);

      const checkThreshold = await this.paymentHistory.getDues(
        'sms',
        influencerNumber.user,
      );

      const country = await this.countryService.countryRepo.findOne({
        where: { code: influencerNumber.country },
      });
      const plan = await this.subService.planService.repository.findOne();
      if (
        checkThreshold &&
        checkThreshold.cost + country.smsCost < plan.threshold
      ) {
        console.log(body, "to", "from");
        sms.create(
          {
            body: body,
            to: contact.phoneNumber, //recipient(s)
            from: influencerNumber.number,
          },
          async (error, res) => {
            if (error) {
              //failure case

              await this.saveSms(
                contact,
                influencerNumber,
                body,
                new Date(),
                type,
                res.sid,
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
                res.sid,
                'sent',
              );
              //success scenario
            }
          },
        );
      } else {
        console.log("Threshold reached");
        throw new BadRequestException(
          'Threshold value reached. Expedite your due payments.',
        );
      }
    } catch (e) {
      throw e;
    }
  }

  //#endregion

  //#region conversation

  async getConversations(inf: UserEntity) {
    try {
      const conversations = await this.conversationsRepo.findOne({
        where: { user: inf },
      });
      if (conversations) {
        return conversations;
      } else {
        return { message: "No conversations created yet." };
      }
    } catch (e) {
      
    }
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
          body: 'Welcome to Colony Systems.',
          name: 'Welcome',
          trigger: presetTrigger.welcome,
          user: user,
        });
        await this.presetRepo.save({
          body:
            'Hi ${name}, You have subscribe to to ${inf_name}. Please complete your profile using this link ${link}',
          name: 'OnBoard',
          trigger: presetTrigger.onBoard,
          user: user,
        });

        await this.presetRepo.save({
          body:
            'Hi ${name}, You recently subscribed me on Colony Systems. Please complete your profile using this link ${link}',
          name: 'NoResponse',
          trigger: presetTrigger.noResponse,
          user: user,
        });
        _preset = await this.presetRepo.find({ where: { user: user } });
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
