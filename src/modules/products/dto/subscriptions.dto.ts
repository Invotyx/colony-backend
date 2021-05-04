import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';

export enum collection_method {
  charge_automatically = 'charge_automatically',
  send_invoice = 'send_invoice',
}

export class SubscriptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: number;

  @ApiPropertyOptional()
  @IsOptional()
  public rId: string;

  @ApiProperty()
  @IsNotEmpty()
  public planId: string;

  @ApiProperty()
  @IsNotEmpty()
  public number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(collection_method)
  public collectionMethod: collection_method;

  @ApiProperty()
  @IsNotEmpty()
  @Length(2, 2)
  public country: string;

  @ApiPropertyOptional()
  @IsOptional()
  public cancelled: boolean;
}
