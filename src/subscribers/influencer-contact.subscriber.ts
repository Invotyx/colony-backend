import { InfluencerContactsEntity } from "../entities/influencer-contacts.entity";
import { nanoid } from "src/shared/random-keygen";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { TransactionStartEvent } from "typeorm/subscriber/event/TransactionStartEvent";
import { TABLES } from "src/consts/tables.const";


@EventSubscriber()
export class InfluencerContactsSubscriber implements EntitySubscriberInterface<InfluencerContactsEntity> {
  
  listenTo() {
    return TABLES.INFLUENCER_CONTACTS.name;
  }
  /**
   * Called after insertion.
   */
  afterInsert(event: InsertEvent<InfluencerContactsEntity>) {
    //event.entity.urlMapper = nanoid();
    console.log("==================",event.metadata.tableName);
    
    console.log(`AFTER INSERTED: `, event.entity);
  }
  /**
   * Called before insertion.
   */
  beforeInsert(event: InsertEvent<InfluencerContactsEntity>) {
    //event.entity.urlMapper = nanoid();
    console.log(`BEFORE INSERTED: `, event.entity);
  }
  
  
}