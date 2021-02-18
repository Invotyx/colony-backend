import { Injectable,Logger  } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
/* 
  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the second is 45');
  } */

  @Interval(86400)
  handleInterval() {
    this.logger.debug('Runs once a day');
  }

  /* @Timeout(5000)
  handleTimeout() {
    this.logger.debug('Called once after 5 seconds');
  } */
}
