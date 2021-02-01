import { Module } from '@nestjs/common';
import { MainMysqlModule } from '../../shared/main-mysql.module';
import { FileMgrService } from './file-mgr.service';

@Module({
  imports: [MainMysqlModule],
  controllers: [],
  providers: [FileMgrService],
  exports: [FileMgrService],
})
export class FileMgrModule {}
