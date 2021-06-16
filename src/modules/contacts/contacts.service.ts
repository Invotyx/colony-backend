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
import { ContactDto, ContactFilter } from './contact.dto';
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
    let query = `SELECT * FROM ${TABLES.CONTACTS.name} c Inner JOIN ${TABLES.INFLUENCER_CONTACTS.name} ic on (c."id" = ic."contactId" and ic."userId" = ${influencerId})`;

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
    if (data.newContacts) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE date_part('day', age(c."createdAt"::date)) < 2`;
      } else {
        query = query + ` and date_part('day', age(c."createdAt"::date)) < 2`;
      }
    }

    //dob
    if (data.newContacts) {
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

    //timezone
    if (data.timezone) {
      if (!query.includes('WHERE')) {
        query = query + ` WHERE c."timezone" = '${data.timezone}'`;
      } else {
        query = query + ` and c."timezone" = '${data.timezone}'`;
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

  async upcomingBirthdays(user: UserEntity) {
    try {
      const contacts = await this.repository.query(`
        select "c".* from "contacts" "c"
        left join "influencer_contacts" "ic" on "ic"."contactId"="c"."id"
        left join "users" "u" on ("u"."id"="ic"."userId" and "u"."id"=${user.id} )
        where extract(month from "c"."dob") = extract(month from current_date)
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
      contactDetails.socialLinks = JSON.stringify(data.socialLinks);
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
          body: 'Welcome onboard ${inf_name}.',
        };
      }

      let infNum = await this.phoneService.findOne({
        where: { id: number },
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
        where: { id: _user.id },
        relations: ['favorites'],
      });
      const contact = await this.findOne({ where: { id: contactId } });
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
        where: { id: _user.id },
        relations: ['favorites'],
      });
      const contact = await this.findOne({ where: { id: contactId } });
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
      const contact = await this.findOne({ where: { id: contactId } });
      if (contact) {
        const check = await this.influencerContactRepo.findOne({
          where: { user: _user, contact: contact },
        });
        await this.influencerContactRepo.delete(check);
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
