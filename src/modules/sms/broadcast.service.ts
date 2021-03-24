import { Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird/types';
import { env } from 'process';
import { UserEntity } from 'src/entities/user.entity';
import { BroadcastContactsRepository } from './repo/broadcast-contact.repo';
import { BroadcastsRepository } from './repo/broadcast.repo';

@Injectable()
export class BroadcastService {
  private mb: MessageBird;
  constructor(
    public readonly repository: BroadcastsRepository,
    public readonly bcRepo: BroadcastContactsRepository
  ) {
    this.mb = require('messagebird')(env.MESSAGEBIRD_KEY);
  }

  async createBroadcast(User: UserEntity) {
    const broadcast = await this.repository.save({
      body: '',
      name: '',
      user: User,
    });

    // send via MessageBird
    let contact: [any];
    contact.forEach(async con => {
      await this.bcRepo.save({
        broadcast: broadcast,
        contact: con,
        isSent: false,
        status: '',
      })
    })
    
  }
 
}
