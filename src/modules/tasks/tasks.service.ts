import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContactsService } from '../contacts/contacts.service';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly contactService: ContactsService,
    private readonly smsService: SmsService,
    private readonly paymentHistoryService: PaymentHistoryService,
  ) {}
  @Cron('30 * * * * *')
  handleCron() {
    this.logger.debug('Called every 30 seconds');
    //this.checkIfContactHasCompletedProfile();
  }

  // check if user has not completed profile yet.
  @Cron('0 0 16 * * *')
  async checkIfContactHasCompletedProfile() {
    const contacts = await this.contactService.repository.find({
      where: { isComplete: false },
      relations: ['user'],
    });

    let influencer;

    for (let contact of contacts) {
      influencer = contact.user;

      const noResponseMessage = this.search(
        'noResponse',
        await this.smsService.getPresetMessage(influencer),
      );

      const threshold = 1;
      const remindersFlag = true;

      if (remindersFlag) {
        if (this.dateDifference(new Date(), contact.createdAt) <= threshold) {
          await this.smsService.sendSms(
            contact,
            influencer,
            noResponseMessage.body,
            'outBound',
          );
        }
      }
    }
  }

  search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].trigger === nameKey) {
        return myArray[i];
      }
    }
  }

  dateDifference(start, end) {
    let firstDate = new Date(start),
      secondDate = new Date(end),
      timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());

    let differenceInDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return differenceInDays;
  }
}
