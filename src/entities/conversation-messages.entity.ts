import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ConversationsEntity } from './conversations.entity';

@Entity({ name: TABLES.CONVERSATION_MESSAGES.name })
export class ConversationMessagesEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @ManyToOne(() => ConversationsEntity, (con) => con.conversationMessages, {
    eager: false,
  })
  public conversations: ConversationsEntity;

  @Column({ length: 1000 })
  public sms: string;

  @Column({ length: 10 })
  public status: string;

  @Column({ length: 10 })
  public type: string;

  @Column({ default: null })
  public receivedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
