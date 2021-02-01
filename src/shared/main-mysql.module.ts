import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities } from '../consts/entities.const';
import { REPOS } from '../consts/repos.const';

const TypeOrm = [
  TypeOrmModule.forRoot({
    retryAttempts: 5, // maybe connectionLimit
    retryDelay: 2000, // ms
  } as any),
  TypeOrmModule.forFeature(REPOS),
];
@Module({
  imports: [...TypeOrm],
  exports: [...TypeOrm],
})
export class MainMysqlModule {}
