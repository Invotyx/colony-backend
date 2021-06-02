import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird/types';
import { env } from 'process';
import { ContactFilter } from '../contacts/contact.dto';
import { ContactsService } from '../contacts/contacts.service';
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
    private readonly contactService: ContactsService,
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

  async createBroadcast(
    user: UserEntity,
    filters: ContactFilter,
    name: string,
    body: string,
    schedule?: Date,
  ) {
    try {
      return this.repository.save({
        body: body,
        user: user,
        filters: JSON.stringify(filters),
        scheduled: schedule ? schedule : null,
        name: name,
        status: schedule ? 'scheduled' : 'inProgress',
      });
    } catch (e) {
      console.log('createBroadcast', e);
      throw new BadRequestException(e);
    }
  }
}
