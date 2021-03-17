import { Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { UsersModule } from '../users/users.module';
import { InfluencerLinksController } from './influencer-links.controller';
import { InfluencerLinksService } from './influencer-links.service';

@Module({
  imports: [MainMysqlModule, UsersModule, ContactsModule],
  controllers: [InfluencerLinksController],
  providers: [InfluencerLinksService],
})
export class InfluencerLinksModule {}
