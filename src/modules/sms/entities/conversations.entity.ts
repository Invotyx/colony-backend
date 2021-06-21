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

  @Column({ nullable: true, default: false })
  public removedFromList: boolean;

  @AfterLoad()
  async getLastConversationMessage() {
    const lastSms = await getRepository(ConversationMessagesEntity)
      .createQueryBuilder()
      .select('*')
      .where('"conversationsId" = :id', { id: this.id })
      .orderBy('"createdAt"', 'DESC')
      .getOne();

    this.lastMessage = lastSms.sms;
    this.lastSmsTime = lastSms.createdAt;
  }
}
