import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class PaymentMethodDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(16)
  card_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 15)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  exp_month: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  exp_year: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  cvc: number;
}
