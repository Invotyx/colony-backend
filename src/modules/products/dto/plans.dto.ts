import {
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ProductsEntity } from 'src/entities/products.entity';
export enum interval {
  month = 'month',
  year = 'year',
}
export class PlansDto {
  @IsOptional()
  public id: string;

  @IsOptional()
  @IsDecimal()
  public amount_decimal: number;

  @IsNotEmpty()
  @IsString()
  @Length(2, 5)
  public currency: string;

  @IsOptional()
  public interval: interval;

  @IsOptional()
  @IsBoolean()
  public active: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  public nickname: string;

  @IsOptional()
  @IsString()
  public product: ProductsEntity;
}
