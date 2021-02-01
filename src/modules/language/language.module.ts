import { Module } from '@nestjs/common';
import { LanguageRepository } from './languages.repo';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';

@Module({
  imports:[LanguageRepository],
  controllers: [LanguageController],
  providers: [LanguageService,LanguageRepository],
  exports:[LanguageService]
})
export class LanguageModule {}
