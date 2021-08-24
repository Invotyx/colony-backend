import { EntityRepository, Repository } from 'typeorm';
import { ContactsEntity } from '../entities/contacts.entity';

@EntityRepository(ContactsEntity)
export class ContactsRepository extends Repository<ContactsEntity> {}
