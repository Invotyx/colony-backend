import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { env } from 'process';
import { TABLES } from 'src/consts/tables.const';
import { ContactsEntity } from 'src/modules/contacts/entities/contacts.entity';
import { GlobalLinksRepository } from 'src/repos/gloabl-links.repo';
import { CityEntity } from 'src/services/city-country/entities/city.entity';
import { uniqueId } from 'src/shared/random-keygen';
import { tagReplace } from 'src/shared/tag-replace';
import { getRepository } from 'typeorm';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhoneService } from '../phone/phone.service';
import { SubscriptionsService } from '../products/subscription/subscriptions.service';
import { SmsService } from '../sms/sms.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/services/users.service';
import {
  ContactDto,
  contacted,
  ContactFilter,
  dob,
  newContacts,
} from './contact.dto';
import { BlockedContactRepository } from './repo/blocked-contact.repo';
import { ContactsRepository } from './repo/contact.repo';
import { FavoriteContactRepository } from './repo/favorite-contact.repo';
import { InfluencerContactRepository } from './repo/influencer-contact.repo';

@Injectable()
export class ContactsService {
  private client;
  constructor(
    private readonly repository: ContactsRepository,
    private readonly influencerContactRepo: InfluencerContactRepository,
    private readonly users: UsersService,
    @Inject(forwardRef(() => SmsService))
    private readonly smsService: SmsService,
    private readonly phoneService: PhoneService,
    private readonly favoriteRepo: FavoriteContactRepository,
    private readonly blockedRepo: BlockedContactRepository,
    private readonly paymentHistory: PaymentHistoryService,
    private readonly subService: SubscriptionsService,
    @Inject(forwardRef(() => InfluencerLinksService))
    private readonly infLinks: InfluencerLinksService,
    private readonly globalLinks: GlobalLinksRepository,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
  }

  public async findOne(condition?: any) {
    if (condition) return this.repository.findOne(condition);
    else return this.repository.findOne();
  }

  public async find(condition?: any) {
    if (condition) return this.repository.find(condition);
    else return this.repository.find();
  }

  public async findInfContacts(condition: any) {
    return this.influencerContactRepo.find(condition);
  }

  async spending(user: UserEntity) {
    try {
      const cost = await this.paymentHistory.getDues('contacts', user);
      const count = await this.influencerContactRepo.count({
        where: {
          user: user,
        },
      });
      return { cost, count };
    } catch (e) {
      throw e;
    }
  }

  async addContact(
    phoneNumber: string,
    userId: number,
    fromCountry: string,
  ): Promise<ContactsEntity> {
    try {
      const user = await this.users.findOne({
        where: { id: userId, isActive: true, isApproved: true },
      });
      if (user) {
        const con = await this.repository.findOne({
          where: { phoneNumber: phoneNumber },
          relations: ['user'],
        });

        if (!con) {
          let contact = new ContactsEntity();
          contact.phoneNumber = phoneNumber;
          contact.user = [user];
          contact.urlMapper = uniqueId(4);
          contact.cCode = fromCountry;
          contact = await this.repository.save(
            await this.repository.create(contact),
          );

          //send on-boarding sms here

          contact.user = null;
          return contact;
        } else {
          const rel = await this.influencerContactRepo.findOne({
            where: { contactId: con.id, userId: user.id },
          });
          if (!rel) {
            await this.influencerContactRepo.save({
              contact: con,
              user: user,
            });
            // con.user.push(user);
            // await this.repository.save(con);
          }
          con.user = null;
          return con;
        }
      } else {
        throw new HttpException(
          'Influencer does not exist or has not activated his/her profile yet.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (ex) {
      throw ex;
    }
  }

  async filterContacts(
    influencerId: number,
    data: ContactFilter,
  ): Promise<{ contacts: ContactsEntity[]; count: number }> {
    let query = `SELECT DISTINCT "c"."id","c"."cCode","c"."profileImage",CONCAT("c"."firstName", ' ', "c"."lastName") AS name ,	"c"."firstName", "c"."lastName","c"."phoneNumber","c"."isComplete",
    "c"."gender","c"."dob","c"."state", "c"."lat","c"."long","c"."facebook","c"."instagram","c"."linkedin", "c"."twitter"
	  FROM ${TABLES.CONTACTS.name} c Inner JOIN ${TABLES.INFLUENCER_CONTACTS.name} ic on (c."id" = ic."contactId" and ic."userId" = ${influencerId})`;

    //contacted_week
    if (data.contacted == contacted.week) {
      query =
        query +
        `
        left join ${TABLES.CONVERSATIONS.name} co on ("co"."userId"=${influencerId} and "co"."contactId"="c"."id")
        left join ${TABLES.CONVERSATION_MESSAGES.name} com on
        ("com"."conversationsId"="co"."id" and
          (
            com."createdAt"::date between (CURRENT_DATE::date - INTERVAL '7 days') and CURRENT_DATE::date
          )
        )
      `;
    }

    //contacted_month
    if (data.contacted == contacted.month) {
      query =
        query +
        `
        left join ${TABLES.CONVERSATIONS.name} co on ("co"."userId"=${influencerId} and "co"."contactId"="c"."id")
        left join ${TABLES.CONVERSATION_MESSAGES.name} com on
        ("com"."conversationsId"="co"."id" and
          (
            com."createdAt"::date between (CURRENT_DATE::date - INTERVAL '1 month') and CURRENT_DATE::date
          )
        )
      `;
    }

    //contacted_year
    if (data.contacted == contacted.year) {
      query =
        query +
        `
        left join ${TABLES.CONVERSATIONS.name} co on ("co"."userId"=${influencerId} and "co"."contactId"="c"."id")
        left join ${TABLES.CONVERSATION_MESSAGES.name} com on
        ("com"."conversationsId"="co"."id" and
          (
            com."createdAt"::date between (CURRENT_DATE::date - INTERVAL '1 year') and CURRENT_DATE::date
          )
        )
      `;
    }

    //never_contacted
    if (data.contacted == contacted.never) {
      query =
        query +
        `
        left join ${TABLES.CONVERSATIONS.name} co on ("co"."userId"=${influencerId} and "co"."contactId"<>"c"."id")
      `;
    }

    if (data.radius && data.lat && data.long) {
      if (!query.includes('WHERE')) {
        query =
          query +
          `
        WHERE (
          6371 * acos (
          cos ( radians(${data.lat}) )
          * cos ( radians( lat ) )
          * cos ( radians( long ) - radians(${data.long}) )
          + sin ( radians(${data.lat}) )
          * sin ( radians( lat ) )
        )
      ) < ${data.radius / 1000}
      `;
      } else {
        query =
          query +
          `
        AND (
          6371 * acos (
          cos ( radians(${data.lat}) )
          * cos ( radians( lat ) )
          * cos ( radians( long ) - radians(${data.long}) )
          + sin ( radians(${data.lat}) )
          * sin ( radians( lat ) )
        )
      ) < ${data.radius / 1000}
      `;
      }
    }

    if (data.hasFb) {
      if (!query.includes('WHERE')) {
        query = query + `WHERE "c"."facebook" IS NOT NULL`;
      } else {
        query = query + ` and  "c"."facebook" IS NOT NULL`;
      }
    }
    //has twitter
    if (data.hasIg) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE  "c"."instagram" IS NOT NULL`;
      } else {
        query = query + ` and "c"."instagram" IS NOT NULL`;
      }
    }
    //has LinkedIn
    if (data.hasLi) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE "c"."linkedin" IS NOT NULL`;
      } else {
        query = query + ` and "c"."linkedin" IS NOT NULL`;
      }
    }
    //has Instagram
    if (data.hasTw) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE "c"."twitter" IS NOT NULL`;
      } else {
        query = query + ` and "c"."twitter" IS NOT NULL`;
      }
    }

    //age
    if (data.ageFrom && data.ageTo) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE c."dob"::date BETWEEN (CURRENT_DATE::date - INTERVAL '${data.ageTo} years') and (CURRENT_DATE::date - INTERVAL '${data.ageFrom} years') `;
      } else {
        query =
          query +
          ` and  c."dob"::date BETWEEN (CURRENT_DATE::date - INTERVAL '${data.ageTo} years') and (CURRENT_DATE::date - INTERVAL '${data.ageFrom} years') `;
      }
    }

    //new contacts
    if (data.newContacts == newContacts.recent) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE  ic."createdAt"::date between CURRENT_DATE::date- INTERVAL '2 days' and CURRENT_DATE::date `;
      } else {
        query =
          query +
          ` and  ic."createdAt"::date between CURRENT_DATE::date- INTERVAL '2 days' and CURRENT_DATE::date `;
      }
    }

    //new contacts week
    if (data.newContacts == newContacts.week) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE ic."createdAt"::date between (CURRENT_DATE::date- INTERVAL '7 days')
            and CURRENT_DATE::date 
          `;
      } else {
        query =
          query +
          ` and ic."createdAt"::date between (CURRENT_DATE::date- INTERVAL '7 days')
            and CURRENT_DATE::date 
            `;
      }
    }

    //new contacts month
    if (data.newContacts == newContacts.month) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE  date_part('month', ic."createdAt"::date) = date_part('month', CURRENT_DATE::date)
            AND date_part('day', ic."createdAt"::date) between 1 and date_part('day', CURRENT_DATE::date) 
          `;
      } else {
        query =
          query +
          ` and  date_part('month', ic."createdAt"::date) = date_part('month', CURRENT_DATE::date)
            AND date_part('day', ic."createdAt"::date) between 1 and date_part('day', CURRENT_DATE::date) 
            `;
      }
    }

    //dob today
    if (data.dob == dob.today) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('day', c."dob"::date) = date_part('day', CURRENT_DATE::date)
            AND date_part('month', c."dob"::date) = date_part('month', CURRENT_DATE::date) 
          `;
      } else {
        query =
          query +
          ` AND date_part('day', c."dob"::date) = date_part('day',CURRENT_DATE::date)
            AND date_part('month', c."dob"::date) = date_part('month', CURRENT_DATE::date) `;
      }
    }

    //dob week
    if (data.dob == dob.week) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', c."dob"::date) = date_part('month',CURRENT_DATE::date)
            AND date_part('day', c."dob"::date) between date_part('day', CURRENT_DATE::date)
            and (date_part('day', CURRENT_DATE::date)+7) 
          `;
      } else {
        query =
          query +
          ` AND  date_part('month', c."dob"::date) = date_part('month',CURRENT_DATE::date)
            AND date_part('day', c."dob"::date) between date_part('day', CURRENT_DATE::date)
            and (date_part('day', CURRENT_DATE::date)+7) `;
      }
    }
    //dob month
    if (data.dob == dob.month) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', c."dob"::date) = date_part('month',CURRENT_DATE::date)
            AND date_part('day', c."dob"::date) >= date_part('day', CURRENT_DATE::date) 
          `;
      } else {
        query =
          query +
          ` and  date_part('month', c."dob"::date) = date_part('month',CURRENT_DATE::date)
            AND date_part('day', c."dob"::date) >= date_part('day', CURRENT_DATE::date) 
          `;
      }
    }

    //gender
    if (data.gender) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE c."gender" = '${data.gender}'`;
      } else {
        query = query + ` and c."gender" = '${data.gender}'`;
      }
    }

    //city
    if (data.city) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE c."cityId" = '${data.city}'`;
      } else {
        query = query + ` and c."cityId" = '${data.city}'`;
      }
    }

    //country
    if (data.country) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE c."countryId" = '${data.country}'`;
      } else {
        query = query + ` and c."countryId" = '${data.country}'`;
      }
    }

    //join date
    if (data.joinDate && data.joinDate.toString() != 'Invalid Date') {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE ic."createdAt"::date = '${JSON.stringify(
            new Date(data.joinDate),
          ).slice(1, 11)}'::date`;
      } else {
        query =
          query +
          ` and ic."createdAt"::date = '${JSON.stringify(
            new Date(data.joinDate),
          ).slice(1, 11)}'::date`;
      }
    }

    if (!query.includes('WHERE')) {
      query = query + ` WHERE c."isComplete" = true`;
    } else {
      query = query + ` AND c."isComplete" = true`;
    }

    console.log('query', query);
    const contacts = await this.repository.query(query);
    return { contacts: contacts, count: contacts.length };
  }

  async getAllContacts(user: UserEntity, count = 100, page = 1) {
    try {
      const contacts = await this.influencerContactRepo.find({
        where: { userId: user.id },
        relations: ['contact'],
        take: count,
        skip: page == 1 ? 0 : count * page - count,
      });
      const _contact = [];
      for (const contact of contacts) {
        if (contact.contact.isComplete) _contact.push(contact.contact);
      }
      return _contact;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async checkRelation(userId: number, contactId: number) {
    return this.influencerContactRepo.findOne({
      where: { userId: userId, contactId: contactId },
    });
  }

  async upcomingBirthdays(user: UserEntity) {
    try {
      const contacts = await this.repository.query(`
        select "c".* from "contacts" "c"
        inner join "influencer_contacts" "ic" on ("ic"."contactId"="c"."id" and "ic"."userId"=${user.id})
        WHERE extract(month from "c"."dob") = extract(month from current_date)
        and extract(day from "c"."dob") = extract(day from current_date)
        and c."isComplete" = true;
      `);
      return contacts;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async updateContact(urlId: string, data: ContactDto, image?: any) {
    const glink = await this.globalLinks.getLink(urlId);
    if (glink) {
      const consolidatedIds = glink.link.split(':');
      //console.log(consolidatedIds);
      const userId = consolidatedIds[0];
      const contactUniqueMapper = consolidatedIds[1];
      const number = consolidatedIds[2];
      const contactDetails = await this.repository.findOne({
        where: { urlMapper: contactUniqueMapper },
        relations: ['country', 'city'],
      });
      let flag = 0;
      if (data.firstName) {
        contactDetails.firstName = data.firstName;
        flag++;
      }
      if (data.lastName) {
        contactDetails.lastName = data.lastName;
        flag++;
      }
      if (data.gender) {
        contactDetails.gender = data.gender;
        flag++;
      }
      if (data.dob) {
        contactDetails.dob = data.dob;
        flag++;
      }
      if (data.state) {
        contactDetails.state = data.state;
        flag++;
      }
      if (data.timezone) {
        contactDetails.timezone = data.timezone;
        flag++;
      }
      if (data.country) {
        contactDetails.country = data.country;
        flag++;
      }
      if (data.city) {
        contactDetails.city = data.city;
        const city = await getRepository(CityEntity).findOne(data.city);
        if (city) {
          contactDetails.lat = city.lat ? city.lat : null;
          contactDetails.long = city.long ? city.long : null;
        }
        flag++;
      }
      if (data.facebook) {
        contactDetails.facebook = data.facebook;
        flag++;
      }

      if (data.instagram) {
        contactDetails.instagram = data.instagram;
        flag++;
      }

      if (data.twitter) {
        contactDetails.twitter = data.twitter;
        flag++;
      }
      if (data.email) {
        contactDetails.email = data.email;
        flag++;
      }

      if (data.linkedin) {
        contactDetails.linkedin = data.linkedin;
        flag++;
      }

      if (image) {
        const file = await this.setProfileImage(contactDetails, image);
        contactDetails.profileImage = file;
        flag++;
      }

      if (flag >= 7) {
        contactDetails.isComplete = true;
      } else {
        contactDetails.isComplete = false;
      }

      try {
        const user = await this.users.findOne({
          where: {
            id: userId,
          },
        });

        let preset_onboard: any = await this.smsService.findOneInPreSets({
          where: { trigger: 'onBoard', user: user },
        });

        if (!preset_onboard) {
          preset_onboard = {
            body: 'Welcome onboard ${name}.',
          };
        }

        const conv = await this.smsService.findOneConversations({
          where: {
            user: user,
            contact: contactDetails,
          },
          relations: ['phone'],
        });

        const savedContact = await this.repository.save(contactDetails);

        let onboardBody = preset_onboard.body;
        const links = onboardBody.match(/\$\{link:[1-9]*[0-9]*\d\}/gm);
        if (links && links.length > 0) {
          for (const link of links) {
            const id = link.replace('${link:', '').replace('}', '');
            const shareableUri = (
              await this.infLinks.getUniqueLinkForContact(
                parseInt(id),
                savedContact.phoneNumber,
              )
            ).url;

            //do action here
            const _publicLink = await this.globalLinks.createLink(shareableUri);
            await this.infLinks.sendLink(shareableUri, savedContact.id + ':');
            onboardBody = onboardBody.replace(
              link,
              env.API_URL + '/api/s/o/' + _publicLink.shareableId,
            );
          }
        }

        await this.smsService.sendSms(
          contactDetails,
          conv.phone,
          tagReplace(onboardBody, {
            first_name: contactDetails.firstName
              ? contactDetails.firstName
              : '',
            last_name: contactDetails.lastName ? contactDetails.lastName : '',
            inf_first_name: user.firstName,
            inf_last_name: user.lastName,
            country: savedContact.country ? savedContact.country.name : '',
            city: savedContact.city ? savedContact.city.name : '',
          }) +
            ' ' +
            preset_onboard.fixedText,
          'outBound',
        );

        return { message: 'Contact details updated.', data: contactDetails };
      } catch (e) {
        console.error(e);
        throw new BadRequestException(e.message);
      }
    } else {
      throw new BadRequestException('No contact found');
    }
  }

  async getUrlMapper(phone: string) {
    try {
      const con = await this.repository.findOne({
        where: { phoneNumber: phone },
      });
      if (con) {
        return { url: con.urlMapper };
      } else {
        return { message: 'No such contact exists with this number.' };
      }
    } catch (e) {
      throw e;
    }
  }

  setProfileImage(contact: ContactsEntity, file: any) {
    if (contact.profileImage) {
      const filePath = join(
        __dirname,
        '../../..',
        'uploads',
        contact.profileImage,
      );
      fs.unlinkSync(filePath);
    }
    return file.filename;
  }


  async checkContact(urlId: string) {
    try {
      const glink = await this.globalLinks.getLink(urlId);
      if (glink) {
        const consolidatedIds = glink.link.split(':');
        const userId = consolidatedIds[0];
        const contactUniqueMapper = consolidatedIds[1];
        const contact = await this.repository.findOne({
          where: { urlMapper: contactUniqueMapper },
        });

        if (contact) {
          const user = await this.users.findOne({ where: { id: userId } });
          
          const influencer = {
            username: user.username,
            dob: user.dob,
            image: user.image,
            statusMessage: user.statusMessage,
            firstName: user.firstName,
            lastName: user.lastName,
            email:user.email
          };
          const conversation = await this.smsService.findOneConversations({
            where: {
              user: user,
              contact: contact,
            },
            relations: ['phone'],
          });
          user.subscription = null;
          user.paymentMethod = null;
          user.customerId = null;
          return { influencer, contact, phone: conversation.phone };
        } else {
          throw new BadRequestException(
            'Contact does not exist in our system.',
          );
        }
      }
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }


  async addToFavorites(_user: UserEntity, contactId: number) {
    try {
      const user = await this.users.findOne({
        where: { id: _user.id },
        relations: ['favorites'],
      });
      const contact = await this.findOne({ where: { id: contactId } });
      if (contact) {
        const checkRel = await this.influencerContactRepo.findOne({
          where: { user: _user, contact: contact },
        });
        if (!checkRel) {
          throw new BadRequestException(
            'You have removed this contact from fans list previously. Cannot add to favorites.',
          );
        }
        user.favorites.push(contact);
        await this.users.save(user);
        return { message: 'Contact marked as favorite.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async checkFavorites(_user: UserEntity, contactId: number) {
    try {
      const check = await this.favoriteRepo.findOne({
        where: { userId: _user.id, contactId: contactId },
      });
      if (check) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }


  
  async createContact(inf:string,data: ContactDto, image?: any) {
    
    const user = await this.users.findOne({ where: { username: inf } });
    if (!user) {
      throw new BadRequestException("Influencer not found");
    }
    const contactDetails = new ContactsEntity();
      let flag = 0;
      if (data.firstName) {
        contactDetails.firstName = data.firstName;
        flag++;
      }
      if (data.lastName) {
        contactDetails.lastName = data.lastName;
        flag++;
      }
      if (data.gender) {
        contactDetails.gender = data.gender;
        flag++;
      }
      if (data.dob) {
        contactDetails.dob = data.dob;
        flag++;
      }
      if (data.state) {
        contactDetails.state = data.state;
        flag++;
      }
      if (data.timezone) {
        contactDetails.timezone = data.timezone;
        flag++;
      }
      if (data.country) {
        contactDetails.country = data.country;
        flag++;
      }
      if (data.city) {
        contactDetails.city = data.city;
        const city = await getRepository(CityEntity).findOne(data.city);
        if (city) {
          contactDetails.lat = city.lat ? city.lat : null;
          contactDetails.long = city.long ? city.long : null;
        }
        flag++;
      }
      if (data.facebook) {
        contactDetails.facebook = data.facebook;
        flag++;
      }

      if (data.instagram) {
        contactDetails.instagram = data.instagram;
        flag++;
      }

      if (data.twitter) {
        contactDetails.twitter = data.twitter;
        flag++;
      }
      if (data.email) {
        contactDetails.email = data.email;
        flag++;
      }

      if (data.linkedin) {
        contactDetails.linkedin = data.linkedin;
        flag++;
      }

      if (image) {
        const file = await this.setProfileImage(contactDetails, image);
        contactDetails.profileImage = file;
        flag++;
      }

      if (flag >= 7) {
        contactDetails.isComplete = true;
      } else {
        contactDetails.isComplete = false;
      }

      try {

        let preset_onboard: any = await this.smsService.findOneInPreSets({
          where: { trigger: 'onBoard', user: user },
        });

        if (!preset_onboard) {
          preset_onboard = {
            body: 'Welcome onboard ${name}.',
          };
        }

        
        const newCon = await this.addContact(contactDetails.phoneNumber, user.id, data.fromCountry);
        contactDetails.id = newCon.id;
        const savedContact = await this.repository.save(contactDetails);

        let onboardBody = preset_onboard.body;
        const links = onboardBody.match(/\$\{link:[1-9]*[0-9]*\d\}/gm);
        if (links && links.length > 0) {
          for (const link of links) {
            const id = link.replace('${link:', '').replace('}', '');
            const shareableUri = (
              await this.infLinks.getUniqueLinkForContact(
                parseInt(id),
                savedContact.phoneNumber,
              )
            ).url;

            //do action here
            const _publicLink = await this.globalLinks.createLink(shareableUri);
            await this.infLinks.sendLink(shareableUri, savedContact.id + ':');
            onboardBody = onboardBody.replace(
              link,
              env.API_URL + '/api/s/o/' + _publicLink.shareableId,
            );
          }
        }

        const phone = await this.phoneService.findOne({ where: { user: user.id, country: data.fromCountry.toUpperCase(), status: 'in-use' } });
        await this.smsService.sendSms(
          contactDetails,
          phone,
          tagReplace(onboardBody, {
            first_name: contactDetails.firstName
              ? contactDetails.firstName
              : '',
            last_name: contactDetails.lastName ? contactDetails.lastName : '',
            inf_first_name: user.firstName,
            inf_last_name: user.lastName,
            country: savedContact.country ? savedContact.country.name : '',
            city: savedContact.city ? savedContact.city.name : '',
          }) +
            ' ' +
            preset_onboard.fixedText,
          'outBound',
        );

        return { message: 'Contact added successfully.', data: contactDetails };
      } catch (e) {
        console.error(e);
        throw new BadRequestException(e.message);
      }
    
  }

  async removeFromFavorites(_user: UserEntity, contactId: number) {
    try {
      const user = await this.users.findOne({
        where: { id: _user.id },
        relations: ['favorites'],
      });
      const contact = await this.findOne({ where: { id: contactId } });
      if (!contact) {
        throw new BadRequestException('Contact not found.');
      }

      const checkRel = await this.influencerContactRepo.findOne({
        where: { user: _user, contact: contact },
      });
      if (!checkRel) {
        return {
          message: 'You have removed this contact from fans list previously.',
        };
      }
      const check = await this.favoriteRepo.findOne({
        where: { user: _user, contact: contact },
      });
      if (check) {
        await this.favoriteRepo.remove(check);
        return { message: 'Contact removed from favorite list.' };
      }
      return { message: 'Contact is not in your favorite list yet.' };
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async myFavorites(_user: UserEntity) {
    try {
      const user = await this.users.findOne({
        where: { id: _user.id },
        relations: ['favorites'],
      });

      if (user && user.favorites) {
        return user.favorites;
      }

      throw new BadRequestException('User not found.');
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async removeFromList(_user: UserEntity, contactId: number) {
    try {
      const contact = await this.findOne({ where: { id: contactId } });
      if (contact) {
        const check = await this.influencerContactRepo.findOne({
          where: { user: _user, contact: contact },
        });
        if (!check) return { message: 'Contact already removed from list.' };

        const checkFav = await this.favoriteRepo.findOne({
          where: { user: _user, contact: contact },
        });
        if (checkFav) {
          await this.favoriteRepo.remove(checkFav);
        }
        const conversation = await this.smsService.findOneConversations({
          where: { user: _user, contact: contact },
          relations: ['contact', 'user'],
        });

        conversation.removedFromList = true;

        const plan = await this.subService.planService.findOne();
        const dues = await this.paymentHistory.getDues('contacts', _user);
        Promise.all([
          this.smsService.saveConversation(conversation),
          this.influencerContactRepo.remove(check),
          this.paymentHistory.updateDues({
            cost: -Math.abs(plan.subscriberCost),
            type: 'contacts',
            user: _user,
          }),
        ]);
        return { message: 'Contact removed from list.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async findContactSpecificCountries(_user: UserEntity) {
    try {
      const countries = await this.repository.query(`
          SELECT DISTINCT "c".* from "phones" "p" left join "country" "c" on ("c"."code"="p"."country" ) WHERE "p"."userId"=${_user.id};
          `);
      return countries;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  //#region  blocked contacts

  async addToBlockList(_user: UserEntity, contactId: number) {
    try {
      const user = await this.users.findOne({
        where: { id: _user.id },
        relations: ['blocked'],
      });

      const contact = await this.findOne({ where: { id: contactId } });
      if (contact) {
        await this.removeFromList(_user, contactId);
        user.blocked.push(contact);
        await this.users.save(user);
        return { message: 'Contact added to block list.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async checkBlockList(_user: UserEntity, contactId: number) {
    try {
      const check = await this.blockedRepo.findOne({
        where: { userId: _user.id, contactId: contactId },
      });
      if (check) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async removeFromBlockList(_user: UserEntity, contactId: number) {
    try {
      const user = await this.users.findOne({
        where: { id: _user.id },
        relations: ['blocked'],
      });
      const contact = await this.findOne({ where: { id: contactId } });
      if (contact) {
        await this.blockedRepo.delete({ user: user, contact: contact });
        return { message: 'Contact removed from blocked list.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async myBlockList(_user: UserEntity) {
    try {
      const user = await this.users.findOne({
        where: { id: _user.id },
        relations: ['blocked'],
      });

      if (user && user.blocked) {
        return user.blocked;
      }

      throw new BadRequestException('User not found.');
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  //#endregion

  //#region  popularity
  async popularityBasedOnCountry(user: UserEntity) {
    const popularity = this.influencerContactRepo.query(`
      SELECT
        "c"."cCode" as country,
        COUNT("c"."id")
      FROM
        "contacts" "c"
        LEFT JOIN "influencer_contacts" "ic"
      ON "c"."id" = "ic"."contactId"
      WHERE
        ( "ic"."userId" = ${user.id} ) 
        AND ( "ic"."deletedAt" IS NULL ) 
      GROUP BY
        "c"."cCode"
      `);
    return popularity;
  }

  async popularityBasedOnCity(user: UserEntity) {
    const popularity = this.influencerContactRepo.query(`
      SELECT
        "ct"."name" as city,
	      "c"."cCode",
        COUNT("c"."id")
      FROM
        "contacts" "c"
        LEFT JOIN "influencer_contacts" "ic" ON "c"."id" = "ic"."contactId"
        LEFT JOIN "city" "ct" ON "ct"."id" = "c"."cityId"

      WHERE
        ( "ic"."userId" = ${user.id} ) 
        AND ( "ic"."deletedAt" IS NULL ) 
      GROUP BY
        "ct"."name",
	      "c"."cCode"
      `);
    return popularity;
  }
  //#endregion
}
