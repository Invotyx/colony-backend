import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { isExist } from '../../shared/repo.fun';
import { LanguageEntity } from './entities/language.entity';
import { LanguageDto } from './language.dto';
import { LanguageRepository } from './languages.repo';

@Injectable()
export class LanguageService {
  constructor(private readonly repository: LanguageRepository) {}

  findAll(): Promise<LanguageEntity[]> {
    return this.repository.find();
  }

  findOneById(id: number): Promise<LanguageEntity> {
    return this.repository.findOne(id);
  }

  public async findOne(condition?: any) {
    if (condition) return this.repository.findOne(condition);
    else return this.repository.findOne();
  }

  public async find(condition?: any) {
    if (condition) return this.repository.find(condition);
    else return this.repository.find();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async languageNameExists(val: any) {
    return isExist(this.repository, 'title', val);
  }
  async languageCodeExists(val: any) {
    return isExist(this.repository, 'code', val);
  }

  async createlanguage(language: LanguageDto) {
    try {
      const isAlreadyExist =
        (await this.languageNameExists(language.title)) ||
        (await this.languageCodeExists(language.code));
      if (isAlreadyExist) {
        throw 'language Already Exists';
      }
      const newlanguage = await this.repository.save(language);
      return { language: plainToClass(LanguageEntity, newlanguage) };
    } catch (error) {
      throw error;
    }
  }

  async updatelanguage(id: string | number, language: LanguageDto) {
    const updateData: any = language;
    try {
      const updatelanguage = await this.repository.update(id, updateData);
      return { language: plainToClass(LanguageEntity, updatelanguage) };
    } catch (error) {
      throw error;
    }
  }
}
