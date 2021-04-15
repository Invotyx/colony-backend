import { Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird/types';
import { env } from 'process';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { PhonesEntity } from 'src/entities/phone.entity';
import { UserEntity } from 'src/entities/user.entity';
import { BroadcastContactsRepository } from './repo/broadcast-contact.repo';
import { BroadcastsRepository } from './repo/broadcast.repo';
import { SmsService } from './sms.service';

@Injectable()
export class BroadcastService {
  private mb: MessageBird;
  constructor(
    public readonly repository: BroadcastsRepository,
    public readonly bcRepo: BroadcastContactsRepository,
    public readonly smsService: SmsService,
  ) {
    this.mb = require('messagebird')(env.MESSAGEBIRD_KEY);
  }

  async createBroadcast(
    User: UserEntity,
    phone: PhonesEntity,
    _con: ContactsEntity[],
    name: string,
    body: string,
  ) {
    const broadcast = await this.repository.save({
      body: body,
      name: name,
      user: User,
      contacts: _con,
    });

    _con.forEach(async (con) => {
      //parse sms body here
      const sms = '';
      // send via MessageBird
      await this.smsService.sendSms(con, phone, body, 'broadcast');
      //push sms to conversation
      await this.bcRepo.save({
        broadcast: broadcast,
        contact: con,
        isSent: true,
        status: '',
      });
    });
  }
}
