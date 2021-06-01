import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Auth } from '../../decorators/auth.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { GetUser } from '../users/get-user.decorator';
import { editFileName, imageFileFilter } from '../users/imageupload.service';
import { ContactDto, ContactFilter } from './contact.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@ApiTags('contacts')
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  @Post('')
  async addContact(
    @Query('phone') phone: string,
    @Query('user') user: number,
    @Query('cc') cCode: string,
  ): Promise<any> {
    return await this.service.addContact(phone, user, cCode);
  }

  @Get('/get-url')
  async getUrlMapper(@Query('phone') phone: string) {
    try {
      return this.service.getUrlMapper(phone);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Get('filter')
  async filterContactsByAge(
    @GetUser() user: UserEntity,
    @Query() data: ContactFilter,
  ) {
    try {
      return await this.service.filterContacts(user.id, data);
    } catch (e) {
      throw e;
    }
  }

  @Get(':urlId/check')
  async checkContact(@Param('urlId') urlId: string) {
    try {
      return this.service.checkContact(urlId);
    } catch (e) {
      throw e;
    }
  }

  @Get(':number/details')
  async getContactDetails(@Param('number') number: string) {
    try {
      const contact = await this.service.findOne({
        where: { phoneNumber: number },
      });
      if (contact) {
        return contact;
      } else {
        throw new BadRequestException('Contact not found.');
      }
    } catch (e) {
      throw e;
    }
  }

  @Put(':urlId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async updateContact(
    @Param('urlId') id: string,
    @Body() data: ContactDto,
    @UploadedFile() image?: any,
  ) {
    try {
      if (!image) return await this.service.updateContact(id, data);
      else return await this.service.updateContact(id, data, image);
    } catch (e) {
      throw e;
    }
  }
}
