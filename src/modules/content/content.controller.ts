import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Auth } from 'src/decorators/auth.decorator';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { editFileName, imageFileFilter } from '../users/imageupload.service';
import { ContentService } from './content.service';
import { FaqsDto } from './dtos/faqs.dto';
import { PagesDto } from './dtos/pages.dto';
import { SectionsDto } from './dtos/sections.dto';
import { FaqsRepository } from './repos/faqs.repo';

@Injectable()
@Controller('content')
@ApiTags('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly faqsRepo: FaqsRepository,
  ) {}

  @Auth({ roles: [ROLES.ADMIN] })
  @Get('page')
  async getPages() {
    try {
      const res = await this.contentService.getAllPages();
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('public/page/:slug')
  async getPublicPage(@Param('slug') slug: string) {
    try {
      const res = await this.contentService.getPage(slug, 'sortOrder');
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Get('page/:slug')
  async getPage(@Param('slug') slug: string) {
    try {
      const res = await this.contentService.getPage(slug, 'id');
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post('page')
  async createPage(@Body() data: PagesDto) {
    try {
      console.log(data);
      const res = await this.contentService.createPage(data);
      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Put('page/:id')
  async updatePage(@Body() data: PagesDto, @Param('id') id: number) {
    try {
      const res = await this.contentService.updatePage(data, id);
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Delete('page/:id')
  async deletePage(@Param('id') id: number) {
    try {
      const res = await this.contentService.deletePage(id);
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post('page/:id/section')
  async createSection(@Body() data: SectionsDto, @Param('id') id: number) {
    try {
      const res = await this.contentService.createSection(id, data);
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Put('page/:pid/section/:secId')
  async updateSection(
    @Body() data: SectionsDto,
    @Param('pid') pid: number,
    @Param('secId') secId: number,
  ) {
    try {
      const res = await this.contentService.updateSection(pid, secId, data);
      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Delete('page/:pid/section/:secId')
  async deleteSection(
    @Param('pid') pid: number,
    @Param('secId') secId: number,
  ) {
    try {
      const res = await this.contentService.deleteSection(pid, secId);
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('page/:pid/section')
  async getSectionsByPageId(@Param('pid') pid: number) {
    try {
      const res = await this.contentService.getSectionByPageId(pid);
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('page/:pid/section/:secId')
  async getSection(@Param('pid') pid: number, @Param('secId') secId: number) {
    try {
      const res = await this.contentService.getSectionDetails(pid, secId);
      return res;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post('page/:id/set-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadPageImage(
    @UploadedFile() image: any,
    @Param('id') id: number /* ,@LoginUser() user: UserEntity */,
  ) {
    const res = await this.contentService.addPageImage(id, image);
    return res;
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post('page/:id/section/:secId/set-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadSectionImage(
    @UploadedFile() image: any,
    @Param('id') id: number,
    @Param('secId') secId: number,
    @Body('position') position: string,
    @Body('title') title: string,
  ) {
    const res = await this.contentService.addSectionImage(
      id,
      secId,
      position,
      title,
      image,
    );
    return res;
  }

  @Get('page/:pid/section/:secId/get-images')
  async getSectionImages(
    @Param('pid') pid: number,
    @Param('secId') secId: number,
  ) {
    try {
      const sectionImages = await this.contentService.getSectionImages(
        pid,
        secId,
      );
      return sectionImages;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('page/:id/get-images')
  async getPageImages(@Param('id') id: number) {
    try {
      const pageImages = await this.contentService.getPageImages(id);
      return pageImages;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('faqs')
  async getFaqs(@Query('page') page: number, @Query('limit') limit: number) {
    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 20;
    }
    const data: any = {
      filter: {
        condition: 'AND',
        rules: [],
        valid: true,
      },
      config: {
        sort: 'id',
        order: 'ASC',
        page: page,
        limit: limit,
      },
    };

    return this.contentService.getAllFaqs(data);
  }

  

  @Post('faqs')
  async addFaq(@Body() faq: FaqsDto) {
    try {
      return this.contentService.addFaq(faq);
    } catch (e) {
      throw e;
    }
  }

  @Put('faqs/:id')
  async updateFaq(@Param('id') id: number, @Body() faqs: FaqsDto) {
    try {
      return this.contentService.updateFaq(id, faqs);
    } catch (e) {
      throw e;
    }
  }

  @Delete('faqs/:id')
  async removeFaq(@Param('id') id: number) {
    return this.contentService.removeFaq(id);
  }

  @Get('faqs/:id')
  async getFaq(@Param('id') id: number) {
    const faq = await this.contentService.getFaq(id);
    if (faq) {
      return faq;
    } else {
      return { message: 'No record found' };
    }
  }
}
