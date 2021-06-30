import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { LoginUser } from 'src/decorators/user.decorator';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { Auth } from '../../decorators/auth.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { editFileName, imageFileFilter } from '../users/imageupload.service';
import { ContactDto, ContactFilter, PaginationDto } from './contact.dto';
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
    return this.service.addContact(phone, user, cCode);
  }

  @Get('/get-url')
  async getUrlMapper(@Query('phone') phone: string) {
    try {
      return this.service.getUrlMapper(phone);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('filter')
  async filterContactsByAge(
    @LoginUser() user: UserEntity,
    @Query() data: ContactFilter,
  ) {
    try {
      return this.service.filterContacts(user.id, data);
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

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('list')
  async getAllContacts(
    @LoginUser() user: UserEntity,
    @Query() data?: PaginationDto,
  ) {
    try {
      return this.service.getAllContacts(user, data.perPage, data.page);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('upcoming-birthdays')
  async upcomingBirthdays(@LoginUser() user: UserEntity) {
    try {
      return this.service.upcomingBirthdays(user);
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
    @UploadedFile() image: any,
  ) {
    try {
      return this.service.updateContact(id, data, image);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post('favorite/:contactId')
  async addToFavorites(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.addToFavorites(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('favorite/:contactId')
  async checkFavorites(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.checkFavorites(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Delete('favorite/:contactId')
  async removeFromFavorites(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.removeFromFavorites(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('favorites')
  async myFavorites(@LoginUser() _user: UserEntity) {
    try {
      return this.service.myFavorites(_user);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Delete('remove-from-list/:contactId')
  async removeFromList(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.removeFromList(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('specific-countries')
  async findContactSpecificCountries(@LoginUser() _user: UserEntity) {
    try {
      return this.service.findContactSpecificCountries(_user);
    } catch (e) {
      throw e;
    }
  }

  //#region  block list

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post('blocked/:contactId')
  async addToBlockList(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.addToBlockList(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('blocked/:contactId')
  async checkBlockList(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.checkBlockList(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Delete('blocked/:contactId')
  async removeFromBlockList(
    @LoginUser() _user: UserEntity,
    @Param('contactId') contactId: number,
  ) {
    try {
      return this.service.removeFromBlockList(_user, contactId);
    } catch (e) {
      throw e;
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('blocked')
  async myBlockList(@LoginUser() _user: UserEntity) {
    try {
      return this.service.myBlockList(_user);
    } catch (e) {
      throw e;
    }
  }
  //#endregion
}
