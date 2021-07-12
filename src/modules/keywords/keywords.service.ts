import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    try {
      const check = await this.findOne({
        where: { user: user, keyword: data.keyword },
      });
      if (check) {
        throw new HttpException(
          error(
            [
              {
                key: data.keyword,
                description: 'Keyword already exists',
                reason: 'DuplicateCheck',
              },
            ],
            HttpStatus.BAD_REQUEST,
            'Keyword already exists',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const keyword = new KeywordsEntity();
      keyword.keyword = data.keyword;
      keyword.message = data.message;
      keyword.user = user;
      return this.repository.save(keyword);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateKeyword(user: UserEntity, data: KeywordsDto, id: number) {
    try {
      const check = await this.findOne({
        where: { user: user, id: id, keyword: data.keyword },
      });
      if (!check) {
        throw new HttpException(
          error(
            [
              {
                key: data.keyword,
                description: 'Keyword not found.',
                reason: 'NotFound',
              },
            ],
            HttpStatus.BAD_REQUEST,
            'Keyword not found.',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      check.keyword = data.keyword;
      check.message = data.message;
      return this.repository.save(check);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  public async deleteKeyword(user: UserEntity, id: number) {
    try {
      const check = await this.findOne({
        where: { user: user, id: id },
      });
      if (!check) {
        throw new HttpException(
          error(
            [
              {
                key: 'keyword',
                description: 'Keyword not found.',
                reason: 'NotFound',
              },
            ],
            HttpStatus.BAD_REQUEST,
            'Keyword not found.',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.repository.remove(check);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
