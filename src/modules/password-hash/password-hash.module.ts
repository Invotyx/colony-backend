import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PasswordHashController } from './password-hash.controller';

@Module({
  imports: [AuthModule],
  controllers: [PasswordHashController],
})
export class PasswordHashModule {}
