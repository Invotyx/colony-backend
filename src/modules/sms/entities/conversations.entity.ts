import { InfluencerContactsEntity } from 'src/modules/contacts/entities/influencer-contacts.entity';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { ContactsEntity } from '../../contacts/entities/contacts.entity';
import { PhonesEntity } from '../../phone/entities/phone.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ConversationMessagesEntity } from './conversation-messages.entity';

@Entity({ name: TABLES.CONVERSATIONS.name })
export class ConversationsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @ManyToOne(() => PhonesEntity, (phone) => phone.conversations, {
    eager: false,
  })
  public phone: PhonesEntity;

  @ManyToOne(() => ContactsEntity, (contact) => contact.conversations, {
    eager: false,
  })
  public contact: ContactsEntity;

  @ManyToOne(() => UserEntity, (user) => user.conversations, {
    eager: false,
  })
  public user: UserEntity;

  @OneToMany(() => ConversationMessagesEntity, (con) => con.conversations, {
    eager: false,
    cascade: true,
  })
  public conversationMessages!: ConversationMessagesEntity;

  @Column({ default: false })
  public isActive: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  public lastMessage: string;
  public lastSmsTime: Date;
  public removedFromList: boolean;

  @AfterLoad()
  async getLastConversationMessage() {
    const innerSelect = getRepository(ConversationMessagesEntity)
      .createQueryBuilder()
      .select('*')
      .where('"conversationsId" = :id', { id: this.id })
      .orderBy('"createdAt"', 'DESC')
      .limit(1);
    this.removedFromList = false;

    const _user = getRepository(ConversationsEntity)
      .createQueryBuilder()
      .select('*')
      .where('"id"=:id', { id: this.id });

    const inf_contact_relation = getRepository(InfluencerContactsEntity)
      .createQueryBuilder()
      .select('*')
      .where('"contactId" = :id', { id: this.contact.id })
      .andWhere('"userId" = :id', { id: (await _user.getRawOne()).userId })
      .orderBy('"createdAt"', 'DESC')
      .limit(1);

    console.log('AfterLoad', await inf_contact_relation.getOne());
    if (await inf_contact_relation.getOne()) this.removedFromList = true;

    this.lastMessage = (await innerSelect.getRawOne()).sms;
    this.lastSmsTime = (await innerSelect.getRawOne()).createdAt;
  }
}
