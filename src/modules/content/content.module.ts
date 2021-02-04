import { Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports:[MainMysqlModule],
  controllers: [ContentController],
  providers: [ContentService]
})
export class ContentModule {}
