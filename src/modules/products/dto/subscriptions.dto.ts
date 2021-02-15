import { IsNotEmpty, IsOptional } from 'class-validator';

export enum collection_method {
  charge_automatically = 'charge_automatically',
  send_invoice = 'send_invoice',
}

export class SubscriptionsDto {
  @IsOptional()
  public id: string;

  @IsNotEmpty()
  public planId: string;

  @IsNotEmpty()
  public collection_method: collection_method;

  @IsOptional()
  public cancelled: boolean;
}
