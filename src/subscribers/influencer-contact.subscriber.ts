import { InfluencerContactsEntity } from "../entities/influencer-contacts.entity";
import { nanoid } from "src/shared/random-keygen";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";


@EventSubscriber()
export class InfluencerContactsSubscriber implements EntitySubscriberInterface<InfluencerContactsEntity> {
  listenTo() {
    return InfluencerContactsEntity;
  }
  /**
   * Called before post insertion.
   */
  beforeInsert(event: InsertEvent<InfluencerContactsEntity>) {
    event.entity.urlMapper = nanoid();
    console.log(`AFTER POST INSERTED: `, event.entity);
  }
}