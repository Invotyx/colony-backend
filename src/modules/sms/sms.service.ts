import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { env } from 'process';
import Pusher from 'pusher';
import { error } from 'src/shared/error.dto';
import { CityCountryService } from '../../services/city-country/city-country.service';
import { smsCount } from '../../shared/sms-segment-counter';
import { tagReplace } from '../../shared/tag-replace';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsEntity } from '../contacts/entities/contacts.entity';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';
import { KeywordsService } from '../keywords/keywords.service';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhonesEntity } from '../phone/entities/phone.entity';
import { PhoneService } from '../phone/phone.service';
import { SubscriptionsService } from '../products/subscription/subscriptions.service';
import { UserEntity } from '../users/entities/user.entity';
import { PresetsDto, PresetsUpdateDto } from './dtos/preset.dto';
import { BroadcastsEntity } from './entities/broadcast.entity';
import { ConversationMessagesEntity } from './entities/conversation-messages.entity';
import { ConversationsEntity } from './entities/conversations.entity';
import { presetTrigger } from './entities/preset-message.entity';
import { BroadcastsRepository } from './repo/broadcast.repo';
import { ConversationsRepository } from './repo/conversation-messages.repo';
import { ConversationMessagesRepository } from './repo/conversation.repo';
import { PresetMessagesRepository } from './repo/sms-presets.repo';
import { SMSTemplatesRepository } from './repo/sms-templates.repo';

@Injectable()
export class SmsService {
  private client;
  private pusher;
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
    @Inject(forwardRef(() => InfluencerLinksService))
    private readonly infLinks: InfluencerLinksService,
    private readonly keywordsService: KeywordsService,
    private readonly broadcastRepo: BroadcastsRepository,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );

    this.pusher = new Pusher({
      key: env.PUSHER_APP_KEY,
      appId: env.PUSHER_APP_ID,
      secret: env.PUSHER_APP_SECRET,
      cluster: env.PUSHER_APP_CLUSTER,
    });
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

  public async saveConversation(conversation: ConversationsEntity) {
    return this.conversationsRepo.save(conversation);
  }

  public async findOneConversationsMessages(condition?: any) {
    if (condition) return this.conversationsMessagesRepo.findOne(condition);
    else return this.conversationsMessagesRepo.findOne();
  }

  public async findConversationsMessages(condition?: any) {
    if (condition) return this.conversationsMessagesRepo.find(condition);
    else return this.conversationsMessagesRepo.find();
  }

  public async findCountInConversationsMessages(condition?: any) {
    if (condition) return this.conversationsMessagesRepo.count(condition);
    else return this.conversationsMessagesRepo.count();
  }

  //#region sms
  async receiveSms(
    sender: string,
    receiver: string,
    body: string,
    receivedAt: Date,
    sid: string,
    fromCountry: string,
    emotions?: any,
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
          const check = await this.contactService.checkBlockList(
            influencerNumber.user,
            contact.id,
          );
          if (check) {
            return { message: 'Arrrgh! You are blocked by this influencer.' };
          }
          const rel = await this.contactService.checkRelation(
            influencerNumber.user.id,
            contact.id,
          );

          const conversation = await this.conversationsRepo.findOne({
            where: { contact: contact, phone: influencerNumber },
            relations: ['contact', 'phone'],
          });

          if (rel && conversation) {
            const lastConversationMessage = await this.conversationsMessagesRepo.findOne(
              {
                where: {
                  conversations: conversation,
                },
                order: {
                  createdAt: 'DESC',
                },
                relations: ['broadcast'],
              },
            );

            const msgType =
              lastConversationMessage &&
              lastConversationMessage.type == 'broadcastOutbound'
                ? 'broadcastInbound'
                : 'inBound';

            if (msgType == 'broadcastInbound') {
              const b = lastConversationMessage.broadcast;
              if (emotions.anger) b.anger = b.anger + 1;
              if (emotions.disgust) b.disgust = b.disgust + 1;
              if (emotions.fear) b.fear = b.fear + 1;
              if (emotions.joy) b.joy = b.joy + 1;
              if (emotions.sadness) b.sadness = b.sadness + 1;
              await this.broadcastRepo.save(b);
            }

            //console.log('conversation found');
            const message = await this.saveSms(
              contact,
              influencerNumber,
              body,
              receivedAt,
              msgType,
              sid,
              'received',
              null,
              msgType == 'broadcastInbound'
                ? lastConversationMessage.broadcast
                : null,
            );
            message.conversations = conversation.id as any;
            message.conversations_contact = (conversation.contact.firstName +
              ' ' +
              conversation.contact.lastName) as any;
            await this.pusher.trigger(
              'colony-dev',
              'sms-received-' + influencerNumber.user.id,
              message,
            );

            //remove from list here
            if (body.toLowerCase() == 'stop') {
              await this.contactService.removeFromList(
                influencerNumber.user,
                contact.id,
              );
            }

            const checkKeyword = await this.keywordsService.findOne({
              where: {
                keyword: body,
                user: influencerNumber.user,
              },
            });

            if (checkKeyword) {
              await this.sendSms(
                contact,
                influencerNumber,
                checkKeyword.message,
                'outBound',
              );
            }
            //console.log(
            //   'saved as regular ' + msgType + ' sms from:',
            //   contact.phoneNumber,
            //   ' to ',
            //   influencerNumber.number,
            //   ' body: ',
            //   body,
            // );
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
        //console.log(
        //   'Influencer not found. Error generated. Returned 200 to twillio hook.',
        // );
        return 200;
      }
    } catch (e) {
      //console.log('Receive SMS', e);
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

    const plan = await this.subService.planService.findOne();
    await this.paymentHistory.updateDues({
      cost: +plan.subscriberCost,
      type: 'contacts',
      user: influencerNumber.user,
    });
    let welcomeBody = preset_welcome.body;
    const links = welcomeBody.match(/\$\{link:[1-9]*[0-9]*\d\}/gm);
    if (links && links.length > 0) {
      for (let link of links) {
        let id = link.replace('${link:', '').replace('}', '');
        const shareableUri = (
          await this.infLinks.getUniqueLinkForContact(
            parseInt(id),
            contact.phoneNumber,
          )
        ).url;

        await this.infLinks.sendLink(shareableUri, contact.id + ':');
        welcomeBody = welcomeBody.replace(
          link,
          env.API_URL + '/api/s/o/' + shareableUri,
        );
      }
    }
    const text_body: string = tagReplace(welcomeBody, {
      first_name: contact.firstName ? contact.firstName : '',
      last_name: contact.lastName ? contact.lastName : '',
      inf_first_name: influencerNumber.user.firstName,
      inf_last_name: influencerNumber.user.lastName,
      country: contact.country ? contact.country.name : '',
      city: contact.city ? contact.city.name : '',
      link:
        env.PUBLIC_APP_URL +
        '/contacts/enroll/' +
        influencerNumber.user.id +
        ':' +
        contact.urlMapper +
        ':' +
        influencerNumber.id,
    });
    await this.sendSms(contact, influencerNumber, text_body, 'outBound');
    //console.log(
    //   'outbound sms sent to:',
    //   contact.phoneNumber,
    //   ' from ',
    //   influencerNumber.number,
    //   ' body ',
    //   text_body,
    // );
  }

  async saveSms(
    contact: ContactsEntity,
    influencerPhone: PhonesEntity,
    body: string,
    receivedAt: Date,
    type: string,
    sid: string,
    status?: string,
    scheduled?: Date,
    broadcast?: BroadcastsEntity,
  ) {
    //create conversation if not created yet.
    //add sms to conversation
    let conversation = await this.conversationsRepo.findOne({
      where: { contact: contact, user: influencerPhone.user },
      relations: ['contact', 'phone', 'user'],
    });
    let message: ConversationMessagesEntity;
    if (conversation) {
      message = await this.conversationsMessagesRepo.save({
        conversations: conversation,
        sms: body,
        status: status,
        scheduled: scheduled ? scheduled : null,
        type: type,
        receivedAt: receivedAt,
        sid: sid,
        broadcast: broadcast ? broadcast : null,
      });

      conversation.removedFromList = false;
      conversation.isActive = true;
      conversation.updatedAt = new Date();
      await this.conversationsRepo.save(conversation);
    } else {
      conversation = await this.conversationsRepo.save({
        contact: contact,
        phone: influencerPhone,
        isActive: false,
        user: influencerPhone.user,
        removedFromList: false,
      });
      message = await this.conversationsMessagesRepo.save({
        conversations: conversation,
        sms: body,
        status: status,
        type: type,
        receivedAt: receivedAt,
        sid: sid,
        broadcast: broadcast ? broadcast : null,
      });
    }

    //console.log('message saved', message);

    const country = await this.countryService.countryRepo.findOne({
      where: { code: conversation.phone.country },
    });

    const smsSegments: number = smsCount(body).segments;

    if (status != 'failed' && type != 'inBound') {
      await this.paymentHistory.updateDues({
        cost: +country.smsCost * smsSegments,
        type: 'sms',
        user: influencerPhone.user,
      });
    }
    return message;
  }

  async initiateSendSms(
    inf: UserEntity,
    contact: string,
    message: string,
    scheduled?: any,
  ) {
    //console.log(message);
    try {
      if (String(message).length < 1) {
        throw new HttpException(
          error(
            [
              {
                key: 'message',
                reason: 'length',
                description: 'message must be greater then 1 character',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const _contact = await this.contactService.findOne({
        where: { phoneNumber: contact },
        relations: ['country', 'city'],
      });
      if (_contact) {
        const conversation = await this.conversationsRepo.findOne({
          where: { contact: _contact, user: inf },
          relations: ['user', 'contact', 'phone'],
        });
        conversation.phone.user = conversation.user as any;
        let _inf_phone = conversation.phone;
        _inf_phone.user = conversation.user;
        if (_inf_phone && _inf_phone.status != 'in-use') {
          const __inf_phone = await this.phoneService.findOne({
            where: { user: inf, country: _contact.cCode, status: 'in-use' },
            relations: ['user'],
          });
          if (__inf_phone) {
            _inf_phone = __inf_phone;
          } else {
            throw new BadRequestException(
              'You do not have any number associated to your account to send sms to this country',
            );
          }
        }

        let welcomeBody = message;
        const links = welcomeBody.match(/\$\{link:[1-9]*[0-9]*\d\}/gm);
        if (links && links.length > 0) {
          for (let link of links) {
            let id = link.replace('${link:', '').replace('}', '');
            const shareableUri = (
              await this.infLinks.getUniqueLinkForContact(
                parseInt(id),
                _contact.phoneNumber,
              )
            ).url;
            await this.infLinks.sendLink(shareableUri, _contact.id + ':');

            welcomeBody = welcomeBody.replace(
              link,
              env.API_URL + '/api/s/o/' + shareableUri,
            );
          }
        }

        //console.log(welcomeBody);
        if (scheduled != null) {
          //handle schedule here
          scheduled = new Date(new Date().getTime() + 3 * 60000);

          this.saveSms(
            _contact,
            _inf_phone,
            tagReplace(welcomeBody, {
              first_name: _contact.firstName ? _contact.firstName : '',
              last_name: _contact.lastName ? _contact.lastName : '',
              inf_first_name: _inf_phone.user.firstName,
              inf_last_name: _inf_phone.user.lastName,
              country: _contact.country ? _contact.country.name : '',
              city: _contact.city ? _contact.city.name : '',
            }),
            null,
            'outBound',
            '',
            'scheduled',
            scheduled,
          );
          return { message: 'Sms scheduled' };
        }
        await this.sendSms(
          _contact,
          _inf_phone,
          tagReplace(welcomeBody, {
            first_name: _contact.firstName ? _contact.firstName : '',
            last_name: _contact.lastName ? _contact.lastName : '',
            inf_first_name: _inf_phone.user.firstName,
            inf_last_name: _inf_phone.user.lastName,
            country: _contact.country ? _contact.country.name : '',
            city: _contact.city ? _contact.city.name : '',
          }),
          'outBound',
        );
        return { message: 'Sms sent' };
      } else {
        throw new HttpException(
          error(
            [
              {
                key: 'to',
                reason: 'contact_has_not_subscribed',
                description:
                  'You cannot send message to contact who has not subscribed you yet.',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    } catch (e) {
      console.error('initiateSms', e);
      throw e;
    }
  }

  async sendSms(
    contact: ContactsEntity,
    influencerNumber: PhonesEntity,
    body: string,
    type: string,
    status?: string,
    broadcast?: BroadcastsEntity,
  ) {
    try {
      const infNum = await this.phoneService.findOne({
        where: {
          number: influencerNumber.number,
        },
        relations: ['user'],
      });
      const checkThreshold = await this.paymentHistory.getDues(
        'sms',
        infNum.user,
      );

      const country = await this.countryService.countryRepo.findOne({
        where: { code: influencerNumber.country },
      });
      if (!country.active) {
        throw new BadRequestException(
          'Sms for this country are not enabled yet.',
        );
      }
      const plan = await this.subService.planService.findOne();

      const cost = checkThreshold ? +checkThreshold.cost + +country.smsCost : 0;

      if (cost >= plan.threshold - 1) {
        const check = await this.paymentHistory.chargeOnThreshold(
          influencerNumber.user,
        );
        if (!check) {
          throw new HttpException(
            'Threshold reached. Payment charge failed.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      if (status && status == 'scheduled') {
        const sms = await this.conversationsMessagesRepo.findOne({
          where: { id: parseInt(body) },
        });

        const msg = await this.client.messages.create({
          body: sms.sms,
          to: contact.phoneNumber, //recipient(s)
          from: influencerNumber.number,
          statusCallback:
            env.API_URL + '/api/sms/receive-sms-status-callback/webhook',
        });
        sms.sid = msg.sid;
        sms.status = msg.status;
        sms.receivedAt = msg.dateUpdated;
        return this.conversationsMessagesRepo.save(sms);
      }

      const message = await this.client.messages.create({
        body: body,
        to: contact.phoneNumber, //recipient(s)
        from: influencerNumber.number,
        statusCallback:
          env.API_URL + '/api/sms/receive-sms-status-callback/webhook',
      });
      return await this.saveSms(
        contact,
        infNum,
        body,
        new Date(),
        type,
        message.sid,
        message.status,
        null,
        broadcast ? broadcast : null,
      );
    } catch (e) {
      console.error('sendSms', e);
      throw e;
    }
  }

  public async updateStatus(sid: string, status: string, from: string) {
    try {
      //console.log(sid, status, from);
      const bc = await this.conversationsMessagesRepo.findOne({
        where: { sid: sid },
      });
      //console.log('message:', bc);
      const influencerNumber = await this.phoneService.findOne({
        where: { number: from },
        relations: ['user'],
      });
      //console.log('influencerNumber:', influencerNumber);

      const country = await this.countryService.countryRepo.findOne({
        where: { code: influencerNumber.country },
      });
      //console.log('country:', country);

      if (status == 'failed') {
        await this.paymentHistory.updateDues({
          cost: -Math.abs(country.smsCost),
          type: 'sms',
          user: influencerNumber.user,
        });
      }
      bc.status = status;
      //console.log('sms: ', bc);
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
        where: { user: inf, isActive: true },
        order: { updatedAt: 'DESC' },
        relations: ['phone', 'contact'],
        take: count,
        skip: page == 1 ? 0 : count * page - count,
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
      });
      //console.log('count', count);
      //console.log('page', page);
      //console.log('skip', count * page - count);

      const conversationMessage = await this.conversationsMessagesRepo.find({
        where: {
          conversations: conversation,
        },
        order: { createdAt: 'DESC' },
        take: count,
        skip: page == 1 ? 0 : count * page - count,
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
          relations: ['contact', 'phone'],
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
      if (String(title).length < 2) {
        throw new HttpException(
          error(
            [
              {
                key: 'title',
                reason: 'length',
                description: 'title must be greater then 2 characters',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (String(body).length < 2) {
        throw new HttpException(
          error(
            [
              {
                key: 'body',
                reason: 'length',
                description: 'body must be greater then 2 characters',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
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
      if (String(title).length < 2) {
        throw new HttpException(
          error(
            [
              {
                key: 'title',
                reason: 'length',
                description: 'title must be greater then 2 characters',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (String(body).length < 2) {
        throw new HttpException(
          error(
            [
              {
                key: 'body',
                reason: 'length',
                description: 'body must be greater then 2 characters',
              },
            ],
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Unprocessable entity',
          ),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

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
        if (String(preset.body).length < 2) {
          throw new HttpException(
            error(
              [
                {
                  key: 'body',
                  reason: 'length',
                  description: 'body must be greater then 2 characters',
                },
              ],
              HttpStatus.UNPROCESSABLE_ENTITY,
              'Unprocessable entity',
            ),
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        if (String(preset.name).length < 2) {
          throw new HttpException(
            error(
              [
                {
                  key: 'name',
                  reason: 'length',
                  description: 'name must be greater then 2 characters',
                },
              ],
              HttpStatus.UNPROCESSABLE_ENTITY,
              'Unprocessable entity',
            ),
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        const _preset: any = await this.presetRepo.save({
          name: preset.name,
          body: preset.body,
          trigger: preset.trigger,
          user: user,
          enabled: preset.enabled,
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

        existing.enabled = preset.enabled ? true : false;

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
            'Hi, You have subscribed to ${inf_first_name}. Please complete your profile using this link ${link}',
          name: 'Welcome',
          trigger: presetTrigger.welcome,
          user: user,
        });
        await this.presetRepo.save({
          body:
            'Welcome ${first_name}! Glad to have you onboard.  Regards ${inf_first_name}. ',
          name: 'OnBoard',
          trigger: presetTrigger.onBoard,
          user: user,
        });

        await this.presetRepo.save({
          body:
            'Hi! This is ${inf_first_name}. You recently sent an sms to my number. Please complete your profile using this link ${link} so that I can get to know my fans better!',
          name: 'NoResponse',
          trigger: presetTrigger.noResponse,
          user: user,
          enabled: true,
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

  async smsActivity(user: UserEntity) {
    try {
      const sql = `SELECT
        cm."createdAt"::date as date,
        COUNT ( cm."id" ) 
      FROM
        conversation_messages cm
        LEFT JOIN conversations C ON cm."conversationsId" = C."id"
        WHERE cm."createdAt"::date > (CURRENT_DATE::date - INTERVAL '30 days') and  c."userId"=${user.id}
        GROUP BY cm."createdAt"::date`;

      const act = await this.conversationsMessagesRepo.query(sql);
      return act ? act : [];
    } catch (e) {
      throw e;
    }
  }

  async popularity(user: UserEntity) {
    try {
      const popularity = await this.conversationsMessagesRepo.query(`
            select p.country, COUNT(cm.id) from conversation_messages cm 
            left join conversations c on c.id=cm."conversationsId"
            left join broadcasts b on b.id = cm."broadcastId"
            left join phones p on p.id = c."phoneId"
            where cm."type"='broadcastInbound' and p."userId"=${user.id} group by p.country
      `);

      const total = await this.conversationsMessagesRepo.query(`
            select COUNT(cm.id) from conversation_messages cm 
            left join conversations c on c.id=cm."conversationsId"
            left join broadcasts b on b.id = cm."broadcastId"
            left join phones p on p.id = c."phoneId"
            where cm."type"='broadcastInbound' and p."userId"=${user.id}
      `);
      //console.log('popularity', popularity);
      let data = {};

      popularity.forEach((number) => {
        data[number.country] =
          (parseInt(number.count) / parseInt(total[0].count)) * 100;
      });
      return data;
    } catch (e) {
      throw e;
    }
  }

  public async search(user: UserEntity, query: string) {
    try {
      query = query.replace('+', '');
      const conversations = await this.conversationsRepo
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.contact', 'co')
        .where('c.userId = :uid', { uid: user.id })
        .andWhere(
          '(LOWER(co.firstName) like LOWER(:q) OR LOWER(co.lastName) like LOWER(:q) OR LOWER(co.phoneNumber) like LOWER(:q))',
          { q: `%${query}%` },
        )
        .getMany();

      return conversations;
    } catch (e) {
      throw e;
    }
  }
}
