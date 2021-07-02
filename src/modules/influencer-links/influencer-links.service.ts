import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  dataViewer,
  mapColumns,
  paginateQuery,
  PaginatorError,
  PaginatorErrorHandler,
} from 'src/shared/paginator';
import { Like } from 'typeorm';
import { TABLES } from '../../consts/tables.const';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { uniqueId } from '../../shared/random-keygen';
import { ContactsService } from '../contacts/contacts.service';
import { BroadcastsEntity } from '../sms/entities/broadcast.entity';
import { InfluencerLinksEntity } from './entities/influencer-links.entity';
import { InfluencerLinksTrackingRepository } from './repo/influencer-links-tracking.repo';
import { InfluencerLinksRepository } from './repo/influencer-links.repo';

@Injectable()
export class InfluencerLinksService {
  constructor(
    private readonly repository: InfluencerLinksRepository,
    private readonly trackingRepo: InfluencerLinksTrackingRepository,
    private readonly contactService: ContactsService,
  ) {}

  async addLink(link: string, user: UserEntity, title?: string) {
    try {
      const check = await this.repository.findOne({ where: { link: link, user: user } });
      if (check) {
        throw new BadRequestException('Link already exists.');
      }
      const inf_links = new InfluencerLinksEntity();
      inf_links.link = link;
      inf_links.urlMapper = uniqueId(6);
      inf_links.user = user;
      inf_links.title = title ? title : null;
      return this.repository.save(inf_links);
    } catch (e) {
      throw e;
    }
  }

  public validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  }

  async getLinkDetailsByUniqueId(id: any) {
    try {
      return this.repository.findOne({
        where: { id: id },
        relations: ['influencerLink'],
      });
    } catch (e) {
      throw e;
    }
  }

  async deleteLink(id: number, user: UserEntity) {
    try {
      const link = await this.repository.findOne({ id: id, user: user });
      console.log(link);
      if (!link) {
        throw new BadRequestException('You cannot delete this link.');
      }
      return this.repository.delete(link.id);
    } catch (e) {
      throw e;
    }
  }

  async updateLink(id: number, link: string, user: UserEntity) {
    try {
      const inf_links = await this.repository.findOne({
        where: { id: id, user: user },
      });
      if (link) {
        inf_links.link = link;
      }
      await this.repository.save(inf_links);
    } catch (e) {
      throw e;
    }
  }

  async searchLink(_link: string, user: UserEntity) {
    try {
      const link = await this.repository.findOne({
        where: {
          link: Like(_link),
          user: user,
        },
      });
      if (!link) {
        throw new NotFoundException('Link not found');
      }
      return link;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

  async getLinkStats(id: number, user: UserEntity) {
    try {
      console.log('Logged In User: ', user);
      const statsOpened = await this.trackingRepo.count({
        where: { influencerLink: id, isOpened: true },
      });
      const statsSent = await this.trackingRepo.count({
        where: { influencerLink: id, sent: true },
      });

      return {
        opened: statsOpened,
        sent: statsSent,
        notOpened: statsSent - statsOpened,
      };
    } catch (e) {
      throw e;
    }
  }

  async getUniqueLinkForContact(id: number, contact: string) {
    try {
      const contactUrl = await this.contactService.findOne({
        where: { phoneNumber: contact },
      });
      const linkUrl = await this.repository.findOne({ where: { id: id } });

      if (!contactUrl || !linkUrl) {
        throw new HttpException(
          "Contact or link doesn't exist",
          HttpStatus.BAD_REQUEST,
        );
      }
      return { url: linkUrl.urlMapper + ':' + contactUrl.urlMapper };
    } catch (e) {
      throw e;
    }
  }

  async updateLinkStatus(id: string, status: string, sid: string) {
    try {
      const linkUrl = await this.trackingRepo.findOne({
        where: { smsSid: id },
      });
      linkUrl.sent = status == 'sent' || status == 'delivered' ? true : false;
      linkUrl.smsSid = sid;

      return this.trackingRepo.save(linkUrl);
    } catch (e) {
      throw e;
    }
  }

  async sendLink(url: string, sid: string, broadcast: BroadcastsEntity) {
    try {
      const parts = url.split(':');
      if (parts.length != 2) {
        throw new HttpException(
          'Invalid format of url string',
          HttpStatus.BAD_GATEWAY,
        );
      }
      const link = parts[0];
      const contact = parts[1];
      const contactUrl = await this.contactService.findOne({
        where: { urlMapper: contact },
      });
      const linkUrl = await this.repository.findOne({
        where: { urlMapper: link },
      });
      let linkSent = await this.trackingRepo.save({
        contact: contactUrl,
        influencerLink: linkUrl,
        isOpened: false,
        sent: false,
        smsSid: sid,
        broadcast: broadcast,
      });
      linkSent.contact = linkSent.contact.id as any;
      linkSent.influencerLink = linkSent.influencerLink.id as any;
      return linkSent;
    } catch (e) {
      throw e;
    }
  }

  async linkOpened(url: string) {
    try {
      const parts = url.split(':');
      if (parts.length != 2) {
        throw new HttpException(
          'Invalid format of url string',
          HttpStatus.BAD_GATEWAY,
        );
      }
      const link = parts[0];
      const contact = parts[1];
      const contactUrl = await this.contactService.findOne({
        where: { urlMapper: contact },
      });
      if (!contactUrl) {
        throw new BadRequestException('contact does not exist.');
      }
      const linkUrl = await this.repository.findOne({
        where: { urlMapper: link },
      });
      if (!linkUrl) {
        throw new BadRequestException("link doesn't exist.");
      }
      const linkSent = await this.trackingRepo.findOne({
        where: { influencerLink: linkUrl, contact: contactUrl },
      });
      if (linkSent) {
        linkSent.isOpened = true;
      } else {
        throw new BadRequestException('link is not sent to this contact yet.');
      }
      const linkOpened = await this.trackingRepo.save(linkSent);
      return linkOpened;
    } catch (e) {
      throw e;
    }
  }

  async getAllLinks(data: any) {
    try {
      const linksTable = TABLES.INFLUENCER_LINKS.name;
      const columnList: any = {
        id: { table: linksTable, column: 'id' },
        title: { table: linksTable, column: 'title' },
        link: { table: linksTable, column: 'link' },
        userId: { table: linksTable, column: 'userId' },
      };
      const sortList = {
        id: { table: linksTable, column: 'id' },
        title: { table: linksTable, column: 'title' },
      };
      const filterList = {
        id: { table: linksTable, column: 'id' },
        title: { table: linksTable, column: 'title' },
        link: { table: linksTable, column: 'link' },
        userId: { table: linksTable, column: 'userId' },
      };
      const { filters, configs } = dataViewer({
        data,
        filterList,
        sortList,
        columnList,
      });
      const query = await this.repository
        .createQueryBuilder(TABLES.INFLUENCER_LINKS.name)
        .select()
        .where(filters.sql);

      const paginatedData = await paginateQuery(query, configs, linksTable);
      if (paginatedData.data.length) {
        paginatedData.data = paginatedData.data.map(
          mapColumns(paginatedData.data[0], columnList),
        );
      }
      return { data: paginatedData.data, meta: paginatedData.meta };
    } catch (error) {
      if (error instanceof PaginatorError) {
        throw PaginatorErrorHandler(error);
      }
      throw error;
    }
  }
}
