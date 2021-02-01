import { Module } from '@nestjs/common';
import { FileMgrService } from '../../services/file-mgr/file-mgr.service';
import { MainMysqlModule } from '../../shared/main-mysql.module';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  controllers: [TokenController],
  imports: [MainMysqlModule],
  providers: [TokenService, FileMgrService],
  exports: [TokenService],
})
export class TokenModule {}
