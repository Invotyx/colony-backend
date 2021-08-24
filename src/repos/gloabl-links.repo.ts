import { EntityRepository, Repository } from 'typeorm';
import { GlobalLinksEntity } from '../entities/global-links.entity';
import { uniqueId } from '../shared/random-keygen';

@EntityRepository(GlobalLinksEntity)
export class GlobalLinksRepository extends Repository<GlobalLinksEntity> {
  async createLink(link: string) {
    return this.save({
      link,
      shareableId: uniqueId(6),
    });
  }

  async getLink(shareableId) {
    return this.findOne({ where: { shareableId } });
  }
}
