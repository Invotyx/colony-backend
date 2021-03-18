import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

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
  public stripeId: string;

  @ApiProperty()
  @IsNotEmpty()
  public planId: string;

  @ApiProperty()
  @IsNotEmpty()
  public collectionMethod: collection_method;

  @ApiPropertyOptional()
  @IsOptional()
  public cancelled: boolean;
}
