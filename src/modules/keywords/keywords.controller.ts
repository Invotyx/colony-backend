import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { UserEntity } from '../users/entities/user.entity';
import { KeywordsDto } from './keywords.dto';
import { KeywordsService } from './keywords.service';

@Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
@Controller('keywords')
export class KeywordsController {
  constructor(private readonly service: KeywordsService) {}

  @Get()
  async getAllKeywords(@LoginUser() user: UserEntity) {
    try {
      return this.service.getAllKeywords(user);
    } catch (e) {
      throw e;
    }
  }

  @Post()
  async newKeyword(@LoginUser() user: UserEntity, @Body() data: KeywordsDto) {
    try {
      return this.service.newKeyword(user, data);
    } catch (e) {
      throw e;
    }
  }

  @Put()
  async updateKeyword(
    @LoginUser() user: UserEntity,
    @Body() data: KeywordsDto,
  ) {
    try {
      return this.service.updateKeyword(user, data);
    } catch (e) {
      throw e;
    }
  }

  @Delete('/:id')
  async deleteKeyword(@LoginUser() user: UserEntity, @Param('id') id: number) {
    try {
      return this.service.deleteKeyword(user, id);
    } catch (e) {
      throw e;
    }
  }
}
