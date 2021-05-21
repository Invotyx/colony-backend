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
  async checkIfContactHasCompletedProfile() {
    const contacts = await this.contactService.repository.find({
      where: { isComplete: false },
      relations: ['user'],
    });

    let tempInfluencer;
    let influencer;

    for (let contact of contacts) {
      influencer = contact.user;
      // get user threshold
      // check if reminders are enabled or not
      // get incomplete preset sms
      // send sms
      // save sms cost to history
      //

      const noResponseMessage = this.search(
        'noResponse',
        await this.smsService.getPresetMessage(influencer),
      );

      const threshold = 5;
      const remindersFlag = true;

      if (remindersFlag) {
        if (this.dateDifference(new Date(), contact.createdAt) <= threshold) {

        }
      }
      tempInfluencer = contact.user;
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
