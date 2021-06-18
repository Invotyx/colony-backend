import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { PaymentDuesRepository } from './due-payment.repo';
import { PaymentHistoryRepository } from './payment-history.repo';

@Injectable()
export class PaymentHistoryService {
  constructor(
    private readonly repository: PaymentHistoryRepository,
    private readonly duesRepo: PaymentDuesRepository,
  ) {}

  public async history(user: UserEntity) {
    try {
      return await this.repository.find({
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
      due.cost = due.cost + parseFloat(dues.cost);
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
      return await this.duesRepo.findOne({
        where: { costType: type, user: user },
      });
    } catch (e) {
      throw e;
    }
  }

  public async addRecordToHistory(r: any) {
    try {
      return await this.repository.save(r);
    } catch (e) {
      throw e;
    }
  }
}
