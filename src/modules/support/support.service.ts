import { Injectable } from '@nestjs/common';
import { SupportEmailSender } from '../../mails/users/support.mailer';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class SupportService {
  constructor(private readonly support: SupportEmailSender) {}
  async sendEmail(user: UserEntity, body: string, subject: string) {
    await this.support.sendEmail(user, subject, body);
  }
}
