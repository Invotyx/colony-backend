import { ApiHideProperty } from '@nestjs/swagger';
import { InfluencerLinksTrackingEntity } from 'src/modules/influencer-links/entities/influencer-links-tracking.entity';
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
import { UserEntity } from '../../users/entities/user.entity';
import { BroadcastsContactsEntity } from './broadcast-contacts.entity';
import { ConversationMessagesEntity } from './conversation-messages.entity';

@Entity({ name: TABLES.BROADCASTS.name })
export class BroadcastsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 200 })
  public name: string;

  @Column({ nullable: true })
  public scheduled: Date;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.broadcasts, { eager: false })
  public user: UserEntity;

  @Column({ type: 'text' })
  public body: string;

  @Column({ type: 'text' })
  public filters: string;

  @Column({ length: 20 })
  public status: string;

  @OneToMany(() => ConversationMessagesEntity, (con) => con.broadcast, {
    eager: false,
    cascade: true,
  })
  public conversationMessages!: ConversationMessagesEntity;

  @OneToMany(() => BroadcastsContactsEntity, (bc) => bc.broadcast, {
    eager: false,
    cascade: true,
  })
  public contacts!: BroadcastsContactsEntity[];

  @Column({ type: 'int4', default: 0 })
  public anger: number;

  @Column({ type: 'int4', default: 0 })
  public disgust: number;

  @Column({ type: 'int4', default: 0 })
  public fear: number;

  @Column({ type: 'int4', default: 0 })
  public joy: number;

  @Column({ type: 'int4', default: 0 })
  public sadness: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  public lastMessage: string;
  public lastSmsTime: Date;

  @OneToMany(() => InfluencerLinksTrackingEntity, (track) => track.broadcast)
  public links!: InfluencerLinksTrackingEntity[];

  @ManyToOne(() => BroadcastsEntity, (b) => b.id, { nullable: true })
  public successor?: BroadcastsEntity;

  public broadcastIncomingMessages: ConversationMessagesEntity[];
  @AfterLoad()
  async getLastConversationMessage() {
    const innerSelect = getRepository(ConversationMessagesEntity)
      .createQueryBuilder()
      .select('*')
      .where('"broadcastId" = :id', { id: this.id })
      .andWhere('"type"=:type', { type: 'broadcastOutbound' })
      .orderBy('"createdAt"', 'DESC')
      .limit(1);
    
    const inboundMessages = getRepository(ConversationMessagesEntity)
      .createQueryBuilder()
      .select('*')
      .where('"broadcastId" = :id', { id: this.id })
      .andWhere('"type"=:type', { type: 'broadcastInbound' })
      .orderBy('"createdAt"', 'DESC');
    
    const messages = await inboundMessages.getMany();
    if (messages) {
      this.broadcastIncomingMessages = messages;
    }
    const val = await innerSelect.getOne();
    if (val) {
      this.lastMessage = val.sms;
      this.lastSmsTime = val.createdAt;
    }
  }
}
