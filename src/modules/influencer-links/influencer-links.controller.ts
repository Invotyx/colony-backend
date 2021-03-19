import {
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { InfluencerLinksService } from './influencer-links.service';

@Injectable()
@Controller('influencer-links')
@ApiTags('influencer-links')
export class InfluencerLinksController {
  constructor(private readonly service: InfluencerLinksService) {}

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('')
  async addLink(
    @LoginUser() influencer: UserEntity,
    @Query('link') link: string,
    @Query('title') title: string,
  ) {
    try {
      return {
        data: await this.service.addLink(link, title, influencer),
        message: 'Link added successfully.',
      };
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('shareable-link')
  async getLinkUrlForContact(
    @Query('linkId') linkId: number,
    @Query('contact') contact: string,
  ) {
    try {
      return await this.service.getUniqueLinkForContact(linkId, contact);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Put('')
  async updateLink(
    @LoginUser() influencer: UserEntity,
    @Query('link') id: number,
    @Query('link') link: string,
    @Query('title') title: string,
  ) {
    try {
      return {
        data: await this.service.updateLink(id, link, title, influencer),
        message: 'Link updated successfully.',
      };
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Delete('')
  async deleteLink(
    @LoginUser() influencer: UserEntity,
    @Query('id') id: number,
  ) {
    try {
      return {
        data: await this.service.deleteLink(id, influencer),
        message: 'Link deleted successfully.',
      };
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Put(':uniqueId/sent')
  async linkSent(@Param('uniqueId') uniqueId: string) {
    try {
      return await this.service.sendLink(uniqueId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Put(':uniqueId/opened')
  async linkOpened(@Param('uniqueId') uniqueId: string) {
    try {
      return await this.service.linkOpened(uniqueId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get(':id/stats')
  async getLinkStats(
    @LoginUser() influencer: UserEntity,
    @Param('id') id: number,
  ) {
    try {
      return await this.service.getLinkStats(id, influencer);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Get('')
  async getLinks(
    @LoginUser() influencer: UserEntity,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 100;
      }
      const data: any = {
        filter: {
          condition: 'AND',
          rules: [
            {
              field: 'userId',
              operator: 'equal',
              value: influencer.id,
            },
          ],
          valid: true,
        },
        config: {
          sort: 'title',
          order: 'ASC',
          page: page,
          limit: limit,
        },
      };

      return await this.service.getAllLinks(data);
    } catch (e) {
      throw e;
    }
  }
}