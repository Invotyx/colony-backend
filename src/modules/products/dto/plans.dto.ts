import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  @Min(0)
  public amount_decimal: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 5)
  public currency: string;

  @ApiPropertyOptional({ enum: interval, enumName: 'interval' })
  @IsOptional()
  public interval: interval;

  @ApiPropertyOptional({
    enum: ['one_time', 'recurring'],
    enumName: 'recurring',
  })
  @IsOptional()
  @IsIn(['one_time', 'recurring'])
  public recurring: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public active: boolean;

  @ApiProperty({ enum: planType, enumName: 'planType' })
  @IsNotEmpty()
  public planType: planType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 60)
  public nickname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public product: ProductsEntity;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  public phoneCount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  public smsCount: number;
}
