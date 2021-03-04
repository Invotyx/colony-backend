import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactsRepository } from './repo/contact.repo';
import { InfluencerContactRepository } from './repo/influencer-contact.repo';
import { ContactDto } from './contact.dto';
import { UsersService } from '../users/services/users.service';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { nanoid } from 'src/shared/random-keygen';
import { TABLES } from 'src/consts/tables.const';

@Injectable()
export class ContactsService {
  constructor(
    public readonly repository: ContactsRepository,
    public readonly influencerContactRepo: InfluencerContactRepository,
    public readonly users: UsersService
  ) { }
  
  async addContact(phoneNumber: string, userId: number): Promise<any>{
    try {
      const user = await this.users.repository.findOne({ where: { id: userId, isActive: true, isApproved: true } });
      if (user) {
        
        let con = await this.repository.findOne({ where: { phoneNumber: phoneNumber } });
        
        if (!con) {
          let contact = new ContactsEntity();
          contact.phoneNumber = phoneNumber;
          contact.user = [user];
          contact.urlMapper = nanoid();
          contact = await this.repository.save(await this.repository.create(contact));

          contact.user = null;
          return contact;
        } else {
          const rel = await this.influencerContactRepo.findOne({ where: { contactId: con.id, userId: user.id } });
          if (!rel) {
            con.user.push(user);
            await this.repository.save(con);
          }
          con.user = null;
          return con;
        }
      } else {
        throw new HttpException('Influencer does not exist or has not activated his/her profile yet.', HttpStatus.BAD_REQUEST);
      }
    } catch (ex) {
      throw ex;
    }
  }

  async filterContactsByAge(ageFrom: number,ageTo: number, influencerId: number) {
    try {
      const contacts = await this.repository.query(`
        SELECT c.* from ${TABLES.CONTACTS.name} c LEFT JOIN ${TABLES.INFLUENCER_CONTACTS.name} ic on (c."id" = ic."contactId" and ic."userId" = $1)
        where  date_part('year', age(c.dob)) BETWEEN $2 and $3
      `, [influencerId, ageFrom, ageTo]);

      return { contacts: contacts, count: contacts.length };
    } catch (e) {
      throw e;
    }
  }

  async filterContacts() {
    //by new contacts
    //by age
    //by gender
    //by locations
    //by joindate

    let query = `SELECT * FROM ${TABLES.CONTACTS.name} c LEFT JOIN ${TABLES.INFLUENCER_CONTACTS.name} ic on (c."id" = ic."contactId" and ic."userId" = $1)`;

    //age
    if (true) {
      if (!query.includes('WHERE')) {
        query = query + `where date_part('year', age(c.dob)) BETWEEN $2 and $3`;
      } else {
        query = query + `and date_part('year', age(c.dob)) BETWEEN $2 and $3`;
      }
    }

    //new contacts
    if (true) {
      if (!query.includes('WHERE')) {
        query = query + `where date_part('day', age(c.createdAt)) <= $2`;
      } else {
        query = query + `and date_part('day', age(c.createdAt)) <= $2`;
      }
    }

    //gender
    if (true) {
      if (!query.includes('WHERE')) {
        query = query + `where c.gender = $2`;
      } else {
        query = query + `and c.gender = $2`;
      }
    }

    
    //city
    if (true) {
      if (!query.includes('WHERE')) {
        query = query + `where c.cityId = $2`;
      } else {
        query = query + `and c.cityId = $2`;
      }
    }

    //country
    if (true) {
      if (!query.includes('WHERE')) {
        query = query + `where c.countryId = $2`;
      } else {
        query = query + `and c.countryId = $2`;
      }
    }


  }

  async filterContactsByGender(gender:string, influencerId: number) {
    try {
      const contacts = await this.repository.query(`
        SELECT c.* from ${TABLES.CONTACTS.name} c LEFT JOIN ${TABLES.INFLUENCER_CONTACTS.name} ic on (c."id" = ic."contactId" and ic."userId" = $1)
        where gender equals $2
      `, [influencerId, gender]);

      return { contacts: contacts, count: contacts.length };
    } catch (e) {
      throw e;
    }
  }


  async updateContact(urlId:string,data: ContactDto) {
    let contactDetails: any;
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
      flag++
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

      await this.repository.update({ urlMapper: urlId }, contactDetails);

      return { message: "Contact details updated.", data: contactDetails };
    } catch (e) {
      throw e;
    }

  }
}
