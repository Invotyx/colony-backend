import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { TABLES } from '../../consts/tables.const';
import { LanguageRepository } from './languages.repo';
import { LanguageEntity } from '../../entities/language.entity';
import { LanguageDto } from './language.dto';
import { isExist } from '../../shared/repo.fun';

@Injectable()
export class LanguageService {
  constructor(
    public readonly repository: LanguageRepository,
  ) {}

  findAll(): Promise<LanguageEntity[]> {
    return this.repository.find();
  }

  findOneById(id: number): Promise<LanguageEntity> {
    return this.repository.findOne(id);
  }
  
  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  
  async languageNameExists(val) {
    return isExist(this.repository, 'title', val);
  }
  async languageCodeExists(val) {
    return isExist(this.repository, 'code', val);
  }

  async createlanguage(language: LanguageDto) {
    try {
      let isAlreadyExist = (await this.languageNameExists(language.title) || await this.languageCodeExists(language.code)) ;
      if (isAlreadyExist) {
        throw "language Already Exists";
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
