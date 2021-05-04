import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export enum interval {
  month = 'month',
  year = 'year',
}

export class PlansDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 60)
  public nickname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  public threshold: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  public subscriberCost: number;
}
