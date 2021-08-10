import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Auth } from './decorators/auth.decorator';
import { CloudinaryService } from './modules/cloudinary/cloudinary.service';
import { ROLES } from './services/access-control/consts/roles.const';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get('app')
  getData() {
    return this.appService.getData();
  }

  @Get('merge-tags')
  getSystemMergeTags() {
    const tags = [
      '${first_name}',
      '${city}',
      '${country}',
      '${inf_first_name}',
    ];

    /* 

      '${last_name}',
      '${inf_last_name}',
    */
    return tags;
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @ApiTags('uploadFile')
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async addCategory(
    @UploadedFile() file: any,
    @Headers() headers: any,
  ): Promise<any> {
    try {
      console.log(file);
      console.log(headers);

      if (file) {
        return this.cloudinary.uploadImage(file, 'email');
      } else {
        throw new BadRequestException();
      }
    } catch (ex) {
      throw ex;
    }
  }
}
