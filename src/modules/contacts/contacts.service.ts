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
import { PhoneService } from '../phone/phone.service';
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
        WHERE: { id: userId, isActive: true, isApproved: true },
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
    let query = `SELECT c.* FROM ${TABLES.CONTACTS.name} c Inner JOIN ${TABLES.INFLUENCER_CONTACTS.name} ic on (c."id" = ic."contactId" and ic."userId" = ${influencerId})`;

    //contacted_week
    if (data.contacted == contacted.week) {
      query =
        query +
        `
        left join ${TABLES.CONVERSATIONS.name} co on ("co"."userId"=${influencerId} and "co"."contactId"="c"."id")
        left join ${TABLES.CONVERSATION_MESSAGES.name} com on
        ("com"."conversationsId"="co"."id" and
          (
            date_part('month', age(com."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            and
            date_part('day', age(com."createdAt"::date)) between
            (date_part('day', age(CURRENT_DATE::date))-7)
            and
            date_part('day', age(CURRENT_DATE::date))
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
            date_part('month', age(com."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            and
            date_part('day', age(com."createdAt"::date)) between
            1 and date_part('day', age(CURRENT_DATE::date))
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
            date_part('year', age(com."createdAt"::date)) = date_part('year', age(CURRENT_DATE::date))
          )
        )
      `;
    }

    //never_contacted
    if (data.contacted == contacted.never) {
      query =
        query +
        `
        left join ${TABLES.CONVERSATIONS.name} co on ("co"."userId"=${influencerId} and "co"."contactId"="c"."id")
        left join ${TABLES.CONVERSATION_MESSAGES.name} com on ("com"."conversationsId"<>"co"."id")
      `;
    }

    query += `, json_array_elements(c."socialLinks"#>'{objects}') clinks `;
    //has facebook
    if (data.hasFb) {
      if (!query.includes('WHERE')) {
        query =
          query + `WHERE clinks->>'title'='facebook' and clinks->>'link'<>''`;
      } else {
        query =
          query + ` and clinks->>'title'='facebook' and clinks->>'link'<>''`;
      }
    }
    //has twitter
    if (data.hasTw) {
      if (!query.includes('WHERE')) {
        query =
          query + ` WHERE clinks->>'title'='twitter' and clinks->>'link'<>''`;
      } else {
        query =
          query + ` and clinks->>'title'='twitter' and clinks->>'link'<>''`;
      }
    }
    //has LinkedIn
    if (data.hasLi) {
      if (!query.includes('WHERE')) {
        query =
          query + ` WHERE clinks->>'title'='linkedin' and clinks->>'link'<>''`;
      } else {
        query =
          query + ` and clinks->>'title'='linkedin' and clinks->>'link'<>''`;
      }
    }
    //has Instagram
    if (data.hasIg) {
      if (!query.includes('WHERE')) {
        query =
          query + ` WHERE clinks->>'title'='instagram' and clinks->>'link'<>''`;
      } else {
        query =
          query + ` and clinks->>'title'='instagram' and clinks->>'link'<>''`;
      }
    }

    //age
    if (data.ageFrom && data.ageTo) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('year', age(c."dob")) BETWEEN ${data.ageFrom} and ${data.ageTo}`;
      } else {
        query =
          query +
          ` and date_part('year', age(c."dob")) BETWEEN ${data.ageFrom} and ${data.ageTo}`;
      }
    }

    //new contacts
    if (data.newContacts == newContacts.recent) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', age(c."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            and date_part('day', age(c."createdAt"::date)) between (date_part('day', age(CURRENT_DATE::date))-2)
            and date_part('day', age(CURRENT_DATE::date))`;
      } else {
        query =
          query +
          `and date_part('month', age(c."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
           and date_part('day', age(c."createdAt"::date)) between (date_part('day', age(CURRENT_DATE::date))-2)
           and date_part('day', age(CURRENT_DATE::date))`;
      }
    }

    //new contacts week
    if (data.newContacts == newContacts.week) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', age(c."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."createdAt"::date)) between (date_part('day', age(CURRENT_DATE::date))-7)
            and date_part('day', age(CURRENT_DATE::date))
          `;
      } else {
        query =
          query +
          ` and  date_part('month', age(c."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."createdAt"::date)) between (date_part('day', age(CURRENT_DATE::date))-7) and
            date_part('day', age(CURRENT_DATE::date))
            `;
      }
    }

    //new contacts month
    if (data.newContacts == newContacts.month) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', age(c."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."createdAt"::date)) between 1 and date_part('day', age(CURRENT_DATE::date))
          `;
      } else {
        query =
          query +
          ` and  date_part('month', age(c."createdAt"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."createdAt"::date)) between 1 and date_part('day', age(CURRENT_DATE::date))
            `;
      }
    }

    //dob today
    if (data.dob == dob.today) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('day', age(c."dob"::date)) = date_part('day', age(CURRENT_DATE::date))
            AND date_part('month', age(c."dob"::date)) = date_part('month', age(CURRENT_DATE::date))
          `;
      } else {
        query =
          query +
          `AND date_part('day', age(c."dob"::date)) = date_part('day', age(CURRENT_DATE::date))
            AND date_part('month', age(c."dob"::date)) = date_part('month', age(CURRENT_DATE::date))`;
      }
    }

    //dob week
    if (data.dob == dob.week) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', age(c."dob"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."dob"::date)) between date_part('day', age(CURRENT_DATE::date))
            and (date_part('day', age(CURRENT_DATE::date))+7)
          `;
      } else {
        query =
          query +
          `AND  date_part('month', age(c."dob"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."dob"::date)) between date_part('day', age(CURRENT_DATE::date))
            and (date_part('day', age(CURRENT_DATE::date))+7)`;
      }
    }
    //dob month
    if (data.dob == dob.month) {
      if (!query.includes('WHERE')) {
        query =
          query +
          ` WHERE date_part('month', age(c."dob"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."dob"::date)) >= date_part('day', age(CURRENT_DATE::date))
          `;
      } else {
        query =
          query +
          ` and date_part('month', age(c."dob"::date)) = date_part('month', age(CURRENT_DATE::date))
            AND date_part('day', age(c."dob"::date)) >= date_part('day', age(CURRENT_DATE::date))
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
    if (data.joinDate) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE c."createdAt"::date = '${data.joinDate}'`;
      } else {
        query = query + ` and c."createdAt"::date = '${data.joinDate}'`;
      }
    }

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
        skip: count * page - count,
      });
      let _contact = [];
      for (let contact of contacts) {
        _contact.push(contact.contact);
      }
      return _contact;
    } catch (e) {
      throw new BadRequestException(e);
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
        left join "influencer_contacts" "ic" on "ic"."contactId"="c"."id"
        left join "users" "u" on ("u"."id"="ic"."userId" and "u"."id"=${user.id} )
        WHERE extract(month from "c"."dob") = extract(month from current_date)
        and extract(day from "c"."dob") = extract(day from current_date);
      `);
      return contacts;
    } catch (e) {
      throw new BadRequestException(e);
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
    if (data.socialLinks.length > 0) {
      contactDetails.socialLinks = JSON.parse(JSON.stringify(data.socialLinks));
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
        WHERE: {
          id: userId,
        },
      });

      let preset_onboard: any = await this.smsService.findOneInPreSets({
        WHERE: { trigger: 'onBoard', user: user },
      });

      if (!preset_onboard) {
        preset_onboard = {
          body: 'Welcome onboard ${name}.',
        };
      }

      let infNum = await this.phoneService.findOne({
        WHERE: { id: number },
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
      throw new BadRequestException(e);
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
      throw new BadRequestException(e);
    }
  }

  async addToFavorites(_user: UserEntity, contactId: number) {
    try {
      const user = await this.users.findOne({
        WHERE: { id: _user.id },
        relations: ['favorites'],
      });
      const contact = await this.findOne({ WHERE: { id: contactId } });
      if (contact) {
        user.favorites.push(contact);
        await this.users.save(user);
        return { message: 'Contact marked as favorite.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findContactSpecificCountries(_user: UserEntity) {
    try {
      const countries = await this.repository.query(`
          SELECT DISTINCT "c".* from "phones" "p" left join "country" "c" on ("c"."code"="p"."country" ) WHERE "p"."userId"=${_user.id};
          `);
      return countries;
    } catch (e) {
      throw new BadRequestException(e);
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
      throw new BadRequestException(e);
    }
  }

  async removeFromFavorites(_user: UserEntity, contactId: number) {
    try {
      const user = await this.users.findOne({
        WHERE: { id: _user.id },
        relations: ['favorites'],
      });
      const contact = await this.findOne({ WHERE: { id: contactId } });
      if (contact) {
        await this.favoriteRepo.delete({ user: user, contact: contact });
        return { message: 'Contact removed from favorite list.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async removeFromList(_user: UserEntity, contactId: number) {
    try {
      const contact = await this.findOne({ WHERE: { id: contactId } });
      if (contact) {
        const check = await this.influencerContactRepo.findOne({
          where: { user: _user, contact: contact },
        });
        if (!check) return { message: 'Contact already removed from list.' };
        const check2 = await this.influencerContactRepo.remove(check);
        return { message: 'Contact removed from list.' };
      }
      throw new BadRequestException('Contact not found');
    } catch (e) {
      throw new BadRequestException(e);
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
      throw new BadRequestException(e);
    }
  }
}
