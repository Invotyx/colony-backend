import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TABLES } from 'src/consts/tables.const';
import { ContactsEntity } from 'src/modules/contacts/entities/contacts.entity';
import { nanoid } from 'src/shared/random-keygen';
import { tagReplace } from 'src/shared/tag-replace';
import { PhoneService } from '../phone/phone.service';
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
    @Inject(forwardRef(() => SmsService))
    public readonly smsService: SmsService,
    public readonly phoneService: PhoneService,
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
    fromCountry: string,
  ): Promise<ContactsEntity> {
    try {
      const user = await this.users.repository.findOne({
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
          contact.urlMapper = nanoid();
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

    if (flag >= 7) {
      contactDetails.isComplete = true;
    } else {
      contactDetails.isComplete = false;
    }

    try {
      const user = await this.users.repository.findOne({
        where: {
          id: userId,
        },
      });

      let preset_onboard: any = await this.smsService.presetRepo.findOne({
        where: { trigger: 'onBoard', user: user },
      });

      if (!preset_onboard) {
        preset_onboard = {
          body: 'Welcome onboard ${inf_name}.',
        };
      }

      let infNum = await this.phoneService.repo.findOne({
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
      throw e;
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

  async checkContact( urlId: string) {
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
      throw e;
    }
  }
}
