import { EntityRepository, Repository } from 'typeorm';
import { SMSTemplatesEntity } from '../entities/sms-templates.entity';

@EntityRepository(SMSTemplatesEntity)
export class SMSTemplatesRepository extends Repository<SMSTemplatesEntity> {}
