import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { env } from 'process';
import { TABLES } from 'src/consts/tables.const';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { nanoid } from 'src/shared/random-keygen';
import { tagReplace } from 'src/shared/tag-replace';
import { SmsService } from '../sms/sms.service';
import { UsersService } from '../users/services/users.service';
import { ContactDto, ContactFilter } from './contact.dto';
import { ContactsRepository } from './repo/contact.repo';
import { InfluencerContactRepository } from './repo/influencer-contact.repo';

@Injectable()
export class ContactsService {
  private client;
  constructor(
    public readonly repository: ContactsRepository,
    public readonly influencerContactRepo: InfluencerContactRepository,
    public readonly users: UsersService,
    @Inject(forwardRef (() => SmsService))
    public readonly smsService: SmsService,
  ) {
    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
  }

  async addContact(
    phoneNumber: string,
    userId: number,
  ): Promise<ContactsEntity> {
    try {
      const user = await this.users.repository.findOne({
        where: { id: userId, isActive: true, isApproved: true },
      });
      if (user) {
        const con = await this.repository.findOne({
          where: { phoneNumber: phoneNumber },
          relations: ["user"]
        });

        if (!con) {
          let contact = new ContactsEntity();
          contact.phoneNumber = phoneNumber;
          contact.user = [user];
          contact.urlMapper = nanoid();
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

  async filterContacts(influencerId: number, data: ContactFilter) {
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

  async updateContact(urlId: string, data: ContactDto) {
    let contactDetails = new ContactsEntity();
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

    if (flag >= 7) {
      contactDetails.isComplete = true;
    } else {
      contactDetails.isComplete = false;
    }

    try {
      const contact = await this.repository.findOne({
        where: { urlMapper: urlId, user: { where: { urlId: urlId } } },
        relations: ['user'],
      });

      const influencer = contact.user[0];
      let preset_onboard: any = await this.smsService.presetRepo.findOne({
        where: { trigger: 'onBoard', user: influencer },
      });

      if (!preset_onboard) {
        preset_onboard = {
          body: 'Welcome onboard ${inf_name}.',
        };
      }

      await this.repository.update({ urlMapper: urlId }, contactDetails);
      await this.smsService.sendSms(
        contactDetails,
        influencer as any,
        tagReplace(preset_onboard.body, {
          name: contact.name ? contact.name : '',
          inf_name: influencer.firstName + ' ' + influencer.firstName,
          link: env.PUBLIC_APP_URL + '/contacts/enroll/' + contact.urlMapper,
        }),
        'outBound',
      ); 
      return { message: 'Contact details updated.', data: contactDetails };
    } catch (e) {
      throw e;
    }
  }
}
