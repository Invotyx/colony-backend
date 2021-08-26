import { EntityRepository, Repository } from 'typeorm';
import { ForgotPassword } from '../entities/forgottenpassword.entity';

@EntityRepository(ForgotPassword)
export class ForgotPasswordRepository extends Repository<ForgotPassword> {}
