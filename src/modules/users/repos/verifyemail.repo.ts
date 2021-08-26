import { EntityRepository, Repository } from 'typeorm';
import { EmailVerifications } from '../entities/verifyemail.entity';

@EntityRepository(EmailVerifications)
export class EmailVerificationsRepository extends Repository<EmailVerifications> {}
