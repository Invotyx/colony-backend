import { Injectable,Logger  } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('* * 23 * * *')
  handleCron() {
    this.logger.debug('Called when the second is 45');
  }

}
