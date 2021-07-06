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
import { TABLES } from 'src/consts/tables.const';
import { ContactsEntity } from 'src/modules/contacts/entities/contacts.entity';
import { uniqueId } from 'src/shared/random-keygen';
import { tagReplace } from 'src/shared/tag-replace';
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
            con.user.push(user);
            await this.repository.save(con);
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
    let query = `SELECT DISTINCT "c"."id",	"c"."name","c"."phoneNumber","c"."isComplete",
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
            date_part('month', com."createdAt"::date) = date_part('month', CURRENT_DATE::date)
            and
            date_part('year', com."createdAt"::date) = date_part('year', CURRENT_DATE::date) and
            date_part('day', com."createdAt"::date) between
            (date_part('day',CURRENT_DATE::date)-7)
            and
            date_part('day', CURRENT_DATE::date)

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
            date_part('month', com."createdAt"::date) = date_part('month', CURRENT_DATE)
            and
            date_part('year', com."createdAt"::date) = date_part('year', CURRENT_DATE::date)
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
            date_part('year', com."createdAt"::date) = date_part('year', CURRENT_DATE::date))
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
      query =
        query +
        `
        left join ${TABLES.CITY.name} ci on ("ci"."id"="c"."cityId" and
          acos(sin("ci"."lat" * 0.0175) * sin(${data.lat} * 0.0175) 
               + cos("ci"."lat" * 0.0175) * cos(${data.lat} * 0.0175) *    
                 cos((${data.long} * 0.0175) - ("ci"."long" * 0.0175))
              ) * 3959 <= ${data.radius}
          )
      `;
    }

    if (data.hasFb) {
      if (!query.includes('WHERE')) {
        query = query + `WHERE "c"."facebook"<>null`;
      } else {
        query = query + ` and  "c"."facebook"<>null`;
      }
    }
    //has twitter
    if (data.hasIg) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE  "c"."instagram"<>null`;
      } else {
        query = query + ` and "c"."instagram"<>null`;
      }
    }
    //has LinkedIn
    if (data.hasLi) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE "c"."linkedin"<>null`;
      } else {
        query = query + ` and "c"."linkedin"<>null`;
      }
    }
    //has Instagram
    if (data.hasTw) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE "c"."twitter"<>null`;
      } else {
        query = query + ` and "c"."twitter"<>null`;
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
          ` WHERE  c."createdAt"::date between CURRENT_DATE::date- INTERVAL '2 days' and CURRENT_DATE::date `;
      } else {
        query =
          query +
          ` and  c."createdAt"::date between CURRENT_DATE::date- INTERVAL '2 days' and CURRENT_DATE::date `;
      }
    }

    //new contacts week
    if (data.newContacts == newContacts.week) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE and c."createdAt"::date between CURRENT_DATE::date- INTERVAL '7 days'
            and CURRENT_DATE::date 
          `;
      } else {
        query =
          query +
          ` and c."createdAt"::date between CURRENT_DATE::date- INTERVAL '7 days'
            and CURRENT_DATE::date 
            `;
      }
    }

    //new contacts month
    if (data.newContacts == newContacts.month) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE  date_part('month', c."createdAt"::date) = date_part('month', CURRENT_DATE::date)
            AND date_part('day', c."createdAt"::date) between 1 and date_part('day', CURRENT_DATE::date) 
          `;
      } else {
        query =
          query +
          ` and  date_part('month', c."createdAt"::date) = date_part('month', CURRENT_DATE::date)
            AND date_part('day', c."createdAt"::date) between 1 and date_part('day', CURRENT_DATE::date) 
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

    console.log(query);

    const contacts = await this.repository.query(query);
    return { contacts: contacts, count: contacts.length };
  }

  async getAllContacts(
    user: UserEntity,
    count: number = 100,
    page: number = 1,
  ) {
    try {
      const contacts = await this.influencerContactRepo.find({
        where: { userId: user.id },
        relations: ['contact'],
        take: count,
        skip: page == 1 ? 0 : count * page - count,
      });
      let _contact = [];
      for (let contact of contacts) {
        _contact.push(contact.contact);
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
        and extract(day from "c"."dob") = extract(day from current_date);
      `);
      return contacts;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  async updateContact(urlId: string, data: ContactDto, image?: any) {
    const consolidatedIds = urlId.split(':::');
    const userId = consolidatedIds[0];
    const contactUniqueMapper = consolidatedIds[1];
    const number = consolidatedIds[2];
    let contactDetails = await this.repository.findOne({
      where: { urlMapper: contactUniqueMapper },
    });
    let flag = 0;
    if (data.name) {
      contactDetails.name = data.name;
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

      let infNum = await this.phoneService.findOne({
        where: { id: number },
        relations: ['user'],
      });

      await this.repository.save(contactDetails);
      await this.smsService.sendSms(
        contactDetails,
        infNum,
        tagReplace(preset_onboard.body, {
          name: contactDetails.name ? contactDetails.name : '',
          inf_name: user.firstName + ' ' + user.lastName,
        }),
        'outBound',
      );

      return { message: 'Contact details updated.', data: contactDetails };
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
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
      const consolidatedIds = urlId.split(':::');
      const userId = consolidatedIds[0];
      const contactUniqueMapper = consolidatedIds[1];
      const contact = await this.repository.findOne({
        where: { urlMapper: contactUniqueMapper },
      });
      if (contact) {
        return contact;
      } else {
        throw new BadRequestException('Contact does not exist in our system.');
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
            cost: +dues.cost - +plan.subscriberCost,
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
}
