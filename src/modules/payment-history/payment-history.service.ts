import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { PaymentDuesRepository } from './due-payment.repo';
import { PaymentDuesEntity } from './entities/due-payments.entity';
import { PaymentHistoryEntity } from './entities/purchaseHistory.entity';
import { PaymentHistoryRepository } from './payment-history.repo';

@Injectable()
export class PaymentHistoryService {
  constructor(
    private readonly repository: PaymentHistoryRepository,
    private readonly duesRepo: PaymentDuesRepository,
  ) {}

  public find(condition: any): Promise<PaymentDuesEntity[]> {
    return this.duesRepo.find(condition);
  }
  public async history(user: UserEntity) {
    try {
      return this.repository.find({
        where: { user: user },
        order: { createdAt: 'DESC' },
      });
    } catch (e) {
      throw e;
    }
  }

  public async setDuesToZero(dues: any) {
    const due = await this.duesRepo.findOne({
      where: { costType: dues.type, user: dues.user },
    });
    if (due) {
      due.cost = 0;
      await this.duesRepo.save(due);
    }
  }

  public async updateDues(dues) {
    const due = await this.duesRepo.findOne({
      where: { costType: dues.type, user: dues.user },
    });
    if (due) {
      due.cost = +(+due.cost + parseFloat(dues.cost)).toFixed(3);
      await this.duesRepo.save(due);
    } else {
      await this.duesRepo.save({
        cost: parseFloat(dues.cost),
        costType: dues.type,
        user: dues.user,
      });
    }
  }

  public async getDues(type: string, user: UserEntity) {
    try {
      return this.duesRepo.findOne({
        where: { costType: type, user: user },
      });
    } catch (e) {
      throw e;
    }
  }

  public async addRecordToHistory(r: any) {
    try {
      return this.repository.save(r);
    } catch (e) {
      throw e;
    }
  }
}
