import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { PaymentDuesRepository } from './due-payment.repo';
import { PaymentHistoryRepository } from './payment-history.repo';

@Injectable()
export class PaymentHistoryService {
  constructor(
    public readonly repository: PaymentHistoryRepository,
    public readonly duesRepo: PaymentDuesRepository,
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

  public async updateDues(dues: any) {
    const due = await this.duesRepo.findOne({
      where: { costType: dues.type, user: dues.user },
    });
    if (due) {
      due.cost = due.cost + dues.cost;
      await this.duesRepo.save(due);
    } else {
      await this.duesRepo.save({
        cost: dues.cost,
        costType: dues.costType,
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
