import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird/types';
import { env } from 'process';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { ContactFilter } from '../contacts/contact.dto';
import { ContactsService } from '../contacts/contacts.service';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhoneService } from '../phone/phone.service';
import { UserEntity } from '../users/entities/user.entity';
import { BroadcastContactsRepository } from './repo/broadcast-contact.repo';
import { BroadcastsRepository } from './repo/broadcast.repo';
import { SmsService } from './sms.service';

@Injectable()
export class BroadcastService {
  private mb: MessageBird;
  constructor(
    private readonly repository: BroadcastsRepository,
    private readonly bcRepo: BroadcastContactsRepository,
    private readonly smsService: SmsService,
    private readonly phoneService: PhoneService,
    private readonly contactService: ContactsService,
    private readonly countryService: CityCountryService,
    private readonly paymentHistory: PaymentHistoryService,
  ) {
    this.mb = require('messagebird')(env.MESSAGEBIRD_KEY);
  }

  async save(user: any) {
    return this.repository.save(user);
  }

  public async findOne(condition?: any) {
    if (condition) return this.repository.findOne(condition);
    else return this.repository.findOne();
  }

  public async find(condition?: any) {
    if (condition) return this.repository.find(condition);
    else return this.repository.find();
  }

  public async qb(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  public async createBroadcast(
    user: UserEntity,
    filters: ContactFilter,
    name: string,
    body: string,
    schedule?: Date,
  ) {
    try {
      if (schedule && env.NODE_ENV == 'development') {
        schedule = new Date(new Date().getTime() + 15 * 60000);
      }
      if (
        (await this.contactService.filterContacts(user.id, filters)).count < 2
      ) {
        throw new BadRequestException(
          'Broadcast must have more then 1 contacts.',
        );
      }
      return this.repository.save({
        body: body,
        user: user,
        filters: JSON.stringify(filters),
        scheduled: schedule ? schedule : new Date(),
        name: name,
        status: schedule ? 'scheduled' : 'inProgress',
      });
    } catch (e) {
      console.log('createBroadcast', e);
      throw new BadRequestException(e.message);
    }
  }

  public calculateTime(schedule: Date) {
    const date_future = new Date(schedule);
    const date_now = new Date();
    let delta = Math.abs(date_future.valueOf() - date_now.valueOf()) / 1000;

    // calculate (and subtract) whole days
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    let minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    let seconds = delta % 60;

    if (days > 0) {
      hours = days > 5 ? 5 : days;
    }

    if (hours > 0) {
      minutes = hours > 20 ? 20 : hours;
    }

    if (minutes > 0) {
      seconds = minutes > 10 ? 10 : hours;
    }

    return new Date(
      date_now.getFullYear(),
      date_now.getMonth(),
      date_now.getDate(),
      hours,
      minutes,
      seconds,
    );
  }

  public async reschedule(id: number, type: string) {
    try {
      const b = await this.repository.findOne({ where: { id: id } });
      return this.repository.save({
        body: b.body,
        user: b.user,
        filters: JSON.stringify({ successorId: b.id, filter: type }),
        scheduled: new Date(),
        name: b.name + ' ' + type,
        status: 'scheduled',
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  public async getBroadcastContacts(user: UserEntity, id: number) {
    try {
      const b = await this.repository.findOne({
        where: { id: id, user: user },
      });
      return this.contactService.filterContacts(user.id, JSON.parse(b.filters));
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  public async getBroadcastStats(user: UserEntity, id: number, filter: string) {
    try {
      const broadcast = await this.repository.findOne({
        where: { id: id, user: user },
      });

      if (
        filter == 'sent' ||
        filter == 'delivered' ||
        filter == 'undelivered' ||
        filter == 'failed'
      ) {
        const [contacts, count] = await this.bcRepo.findAndCount({
          select: ['contact'],
          where: {
            broadcast: broadcast,
            status: filter,
          },
          relations: ['contact'],
        });
        return { contacts, count };
      }
      throw new BadRequestException('No contacts found.');
    } catch (e) {
      throw e;
    }
  }

  public async getBroadcastMessages(bid: number) {
    try {
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  public async addContactToBroadcastList(broadcast, contact, smsSid, status) {
    try {
      const item = await this.bcRepo.save({
        broadcast: broadcast,
        contact: contact,
        smsSid: smsSid,
        status: status,
      });
      return item;
    } catch (e) {
      throw e;
    }
  }

  public async getBroadcasts(
    user: UserEntity,
    count: number = 100,
    page: number = 1,
  ) {
    try {
      const b = await this.repository.find({
        where: { user: user },
        take: count,
        skip: page == 1 ? 0 : count * page - count,
      });
      for (let i of b) {
        i.contacts = (await this.contactService.filterContacts(
          user.id,
          JSON.parse(i.filters),
        )) as any;
      }
      return b;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

  public async updateStatus(sid: string, status: string, from: string) {
    try {
      const bc = await this.bcRepo.findOne({ where: { smsSid: sid } });

      const influencerNumber = await this.phoneService.findOne({
        where: { number: from },
      });
      const country = await this.countryService.countryRepo.findOne({
        where: { code: influencerNumber.country },
      });

      if (bc.status != 'sent' && status == 'sent') {
        await this.paymentHistory.updateDues({
          cost: country.smsCost,
          type: 'sms',
          user: influencerNumber.user,
        });
      }
      bc.status = status;
      return this.bcRepo.save(bc);
    } catch (e) {
      throw e;
    }
  }
}
