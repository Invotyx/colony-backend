import { forwardRef, Module } from '@nestjs/common';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ApiCallingModule } from '../../services/api-calling/api-calling.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { ProductsModule } from '../products/products.module';
import { PaymentMethodsService } from '../products/services/payment-methods.service';
import { UsersModule } from '../users/users.module';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';

@Module({
  imports: [
    MainMysqlModule,
    ApiCallingModule,
    UsersModule,
    forwardRef(() => CityCountryModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => PaymentHistoryModule),
  ],
  controllers: [PhoneController],
  providers: [PhoneService, ApiCallingService, PaymentMethodsService, CityCountryService],
  exports: [PhoneService],
})
export class PhoneModule {}
