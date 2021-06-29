import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { BroadcastsEntity } from './broadcast.entity';
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

  @ManyToOne(() => BroadcastsEntity, (b) => b.conversationMessages, {
    eager: false,
  })
  public broadcast: BroadcastsEntity;

  @Column({ length: 1000 })
  public sms: string;

  @Column({ nullable: true })
  public scheduled: Date;
  
  @Column({ length: 10 })
  public status: string;

  @Column({ length: 10 })
  public type: string;

  @Column({ length: 100, nullable: true })
  public sid: string;

  @Column({ default: null })
  public receivedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
