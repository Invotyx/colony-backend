import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class PaymentMethodDto {
  @IsOptional()
  public id: string;

  @IsNotEmpty()
  @Length(16)
  card_number: string;

  @IsNotEmpty()
  @Length(3, 15)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  exp_month: number;

  @IsNotEmpty()
  @IsNumber()
  exp_year: number;

  @IsNotEmpty()
  @IsNumber()
  cvc: number;
}
