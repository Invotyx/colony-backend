import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  dataViewer,
  mapColumns,
  paginateQuery,
  PaginatorError,
  PaginatorErrorHandler,
} from 'src/shared/paginator';
import { TABLES } from '../../consts/tables.const';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { uniqueId } from '../../shared/random-keygen';
import { ContactsService } from '../contacts/contacts.service';
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

  async addLink(link: string, title: string, user: UserEntity) {
    try {
      const inf_links = new InfluencerLinksEntity();
      inf_links.title = title;
      inf_links.link = link;
      inf_links.urlMapper = uniqueId(6);
      inf_links.user = user;

      await this.repository.save(inf_links);
    } catch (e) {
      throw e;
    }
  }

  async deleteLink(id: number, user: UserEntity) {
    try {
      return await this.repository.softDelete({ id: id, user: user });
    } catch (e) {
      throw e;
    }
  }

  async updateLink(id: number, link: string, title: string, user: UserEntity) {
    try {
      const inf_links = await this.repository.findOne({
        where: { id: id, user: user },
      });
      if (title) {
        inf_links.title = title;
      }
      if (link) {
        inf_links.link = link;
      }
      await this.repository.save(inf_links);
    } catch (e) {
      throw e;
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

  async sendLink(url: string) {
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
        return { message: "contact doesn't exist." };
      }
      const linkUrl = await this.repository.findOne({
        where: { urlMapper: link },
      });
      if (!linkUrl) {
        return { message: "link doesn't exist." };
      }

      //Send link via sms here......

      let linkSent = await this.trackingRepo.findOne({
        where: { influencerLink: linkUrl, contact: contactUrl },
      });
      if (!linkSent) {
        linkSent = await this.trackingRepo.save({
          contact: contactUrl,
          influencerLink: linkUrl,
          isOpened: false,
          sent: true,
        });
        linkSent.contact = linkSent.contact.id as any;
        linkSent.influencerLink = linkSent.influencerLink.id as any;
        return linkSent;
      } else {
        return { message: 'This Link is already sent to this contact' };
      }
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
        return { message: "contact doesn't exist." };
      }
      const linkUrl = await this.repository.findOne({
        where: { urlMapper: link },
      });
      if (!linkUrl) {
        return { message: "link doesn't exist." };
      }
      const linkSent = await this.trackingRepo.findOne({
        where: { influencerLink: linkUrl, contact: contactUrl },
      });
      if (linkSent) {
        linkSent.isOpened = true;
      } else {
        return { message: 'link is not sent to this contact yet.' };
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
