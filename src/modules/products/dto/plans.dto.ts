import {
  IsBoolean,
  IsDecimal,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ProductsEntity } from 'src/entities/products.entity';

export enum interval {
  month = 'month',
  year = 'year',
}

export enum planType {
  bundle = 'bundle',
  phoneOnly = 'phoneOnly',
  smsOnly = 'smsOnly',
}

export class PlansDto {
  @IsOptional()
  public id: string;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  public amount_decimal: number;

  @IsNotEmpty()
  @IsString()
  @Length(2, 5)
  public currency: string;

  @IsOptional()
  public interval: interval;

  @IsOptional()
  @IsIn(['one_time', 'recurring'])
  public recurring: string;

  @IsOptional()
  @IsBoolean()
  public active: boolean;

  @IsNotEmpty()
  public planType: planType;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  public nickname: string;

  @IsOptional()
  @IsString()
  public product: ProductsEntity;

  @IsNotEmpty()
  @Min(0)
  public phoneCount: number;

  @IsNotEmpty()
  @Min(0)
  public smsCount: number;
}
