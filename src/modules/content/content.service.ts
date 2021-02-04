import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { TABLES } from 'src/consts/tables.const';
import { ImagesEntity } from 'src/entities/images.entity';
import { SectionsEntity } from 'src/entities/sections.entity';
import { PagesDto } from './dtos/pages.dto';
import { SectionsDto } from './dtos/sections.dto';
import { ImagesRepository } from './repos/images.repo';
import { PagesRepository } from './repos/pages.repo';
import { PostsRepository } from './repos/posts.repo';
import { SectionsRepository } from './repos/sections.repo';

@Injectable()
export class ContentService {

  constructor(
    private readonly pagesRepo: PagesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly imagesRepo: ImagesRepository,
    private readonly postsRepo:PostsRepository
  ) { }
  
  //#region pages

  
  async getAllPages() {
    const pages = await this.pagesRepo.find();
    if (isEmpty(pages)) {
      return "no records found";
    } else {
      return ({ pages });
    }
  }

  async getPage(slug: string) {
    const page = await this.pagesRepo.findOne({ where: { slug: slug } });
    if (isEmpty(page.slug)) {
      return "no records found";
    } else {  
      let sections: any;
      sections = await this.sectionsRepo.find({ where: { pages: page.id } });
      return ({ page, sections });
    }
  }

  async createPage(data: PagesDto) {
    if (isEmpty(data.title) || isEmpty(data.slug)) {
      throw new HttpException("Title and slug should not be empty.", HttpStatus.BAD_REQUEST);
    } else {
      const check = await this.pagesRepo.findOne({ where: { slug: data.slug } });
      if (!check) {
        return await this.pagesRepo.save(data);  
      } else {
        throw new HttpException("Page with same slug already exists", HttpStatus.BAD_REQUEST);
      }      
    }
  }
  async updatePage(data: PagesDto, id: number) {
    const check = await this.pagesRepo.findOne(id);
    if (check) {
        
        let page: any;
        if (data.title) {
          page.title = data.title;
        }
        if (data.slug) {
          page.slug = data.slug;
        }
        if (data.subTitle) {
          page.subTitle = data.subTitle;
        }
        return await this.pagesRepo.update(id,page); 
      } else {
        throw new HttpException("Page not found.", HttpStatus.NOT_FOUND);
      } 
         
  }

  async deletePage(id: number) {
    
    const sections = (await this.getSectionByPageId(id)).sections;
    console.log(sections);
    if (sections) {
      sections.forEach(async section => {
        await this.deleteSection(id, section.id);
      });
    }
    const images = await this.getPageImages(id);
    images.forEach(async image => {
      await this.deletePageImage(id, image.id);
    });
    return await this.pagesRepo.delete(id);      
  }

  //#endregion

  //#region sections
  async createSection(id: number, data: SectionsDto) {
    const page = await this.pagesRepo.findOne(id);
    if (page) {
      if (isEmpty(data.title)) {
        throw new HttpException("Title should not be empty.", HttpStatus.BAD_REQUEST);
      } else {
        const sec = await this.sectionsRepo.findOne({ where: { pages: id, title: data.title } });
        if (sec) {
          throw new HttpException("section with same title already exists for this page.", HttpStatus.BAD_REQUEST);
        } else {
          data.pages = id as any;
          const create = await this.sectionsRepo.save(data);
          return create;
        }
      }
    } else {
      throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
    }
  }

  async updateSection(pageId: number, secId: number, data: SectionsDto) {
    try {
      const page = await this.pagesRepo.findOne(pageId);
      if (page) {
        const section = await this.sectionsRepo.findOne({ where: { pages: page.id, id: secId } })
        let sec: any;
        if (section) {
          if (data.primaryButton) {
            sec.primaryButton = data.primaryButton;
          }
          if (data.content) {
            sec.content = data.content;
          }
          if (data.secondaryButton) {
            sec.secondaryButton = data.secondaryButton;
          }
          if (data.imagePosition) {
            sec.imagePosition = data.imagePosition;
          }
          if (data.sortOrder) {
            sec.sortOrder = data.sortOrder;
          }
          if (data.subTitle) {
            sec.subTitle = data.subTitle;
          }
          if (data.title) {
            sec.title = data.title;
          }
          return await this.sectionsRepo.update(section.id, sec);
        } else {
          throw new HttpException("specified section not found for this page.", HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      throw e;
    }
  }

  
  async deleteSection(pageId: number, secId: number) {
    try {
      const page = await this.pagesRepo.findOne(pageId);
      if (page) {
        const section = await this.sectionsRepo.findOne({ where: { pages: page.id, id: secId } })
        if (section) {
          const secImages = await this.getSectionImages(pageId, secId);
          if (secImages) {
            secImages.forEach(async image => {
              await this.deleteSectionImage(pageId, secId, image.id);
            });
          }
          return await this.sectionsRepo.delete(section);
        } else {
          throw new HttpException("section not found for specified page.", HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      throw e;
    }
  }

  async getSectionByPageId(pid: number) {
    try {
      const page = await this.pagesRepo.findOne({ where: { id: pid } });
      const sections  = await this.sectionsRepo.find({where: { pages: pid } });
      return { page, sections };
    } catch (e) {
      throw e;
    }
  }

  async getSectionDetails(pid: number, secId: number) {
    try {
      const section = await this.sectionsRepo.findOne({ where: { pages: pid, id: secId } })
      return section;
    } catch (e) {
      throw e;
    }
  }
  //#endregion
  
  //#region images
  // add and delete page image
  // add and delete section image
  

  async addPageImage(
    pid:number,
    file
  ) {
    const page =await this.pagesRepo.findOne(pid);
    if (page) {
      const image = new ImagesEntity();
      image.pages = page;
      image.url = file.filename;
      await this.imagesRepo.save(image);
      return  "Image uploaded";
    } else {
      throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
    }
  }

  async addSectionImage(
    pid: number,
    secId: number,
    file
  ) {
    console.log(file);
    const page =await this.pagesRepo.findOne(pid);
    if (page) {
      const section = await this.sectionsRepo.findOne(secId);
      if (section) {
        const image = new ImagesEntity();
        image.pages = page;
        image.sections = section;
        image.url = file.filename;
        await this.imagesRepo.save(image);
        return "Image uploaded";
      }else {
        throw new HttpException("section not found for specified page.", HttpStatus.BAD_REQUEST);
      }
    }else {
      throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
    }
  }

  
  async getSectionImages(
    pid: number,
    secId: number
  ) {
    const page =await this.pagesRepo.findOne(pid);
    if (page) {
      const section = await this.sectionsRepo.findOne(secId);
      if (section) {
        const images = this.imagesRepo.find({ where: { pages: pid, sections: secId } });
        return await images;
      }else {
        throw new HttpException("section not found for specified page.", HttpStatus.BAD_REQUEST);
      }
    }else {
      throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
    }
  }
  
  async getPageImages(
    pid:number
  ) {
    const page =await this.pagesRepo.findOne(pid);
    if (page) {
      const images = this.imagesRepo.find({ where: { pages: pid, sections:null } });
      return await images;
    }else {
      throw new HttpException("page not found.", HttpStatus.BAD_REQUEST);
    }
  }

  
  async deletePageImage(
    pid: number,
    id: number
  ) {
    return await this.imagesRepo.delete(await this.imagesRepo.findOne({ where: { pages: pid, id: id } }));
  }

  
  async deleteSectionImage(
    pid: number,
    secId: number,
    id: number
  ) {
    return await this.imagesRepo.delete(await this.imagesRepo.findOne({
      where: {
        pages: pid,
        sections: secId,
        id: id
      }
    }));
  }

  //#endregion

}
