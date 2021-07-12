import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { error } from 'src/shared/error.dto';
import { UserEntity } from '../users/entities/user.entity';
import { KeywordsDto } from './keywords.dto';
import { KeywordsEntity } from './keywords.entity';
import { KeywordsRepository } from './keywords.repo';

@Injectable()
export class KeywordsService {
  constructor(private readonly repository: KeywordsRepository) {}

  public async findOne(condition: any) {
    return this.repository.findOne(condition);
  }
  public async findMany(condition: any) {
    return this.repository.find(condition);
  }
  public async count(condition: any) {
    return this.repository.count(condition);
  }

  public async getAllKeywords(user: UserEntity) {
    return this.findMany({ where: { user: user } });
  }

  public async newKeyword(user: UserEntity, data: KeywordsDto) {
    const check = await this.findOne({ where: { user: user, keyword: data.keyword } });
    if (check) {
      //throw new HttpException(error([{key:data.keyword,description:'Keyword already exists',reason:'Duplicate'}],HttpStatus.BAD_REQUEST,))
    }

    const keyword = new KeywordsEntity();

  }
}
