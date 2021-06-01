import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird/types';
import { env } from 'process';
import { ContactFilter } from '../contacts/contact.dto';
import { ContactsEntity } from '../contacts/entities/contacts.entity';
import { PhonesEntity } from '../phone/entities/phone.entity';
import { UserEntity } from '../users/entities/user.entity';
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
    filters:ContactFilter,
    name: string,
    body: string,
  ) {

    
    
  }
}
