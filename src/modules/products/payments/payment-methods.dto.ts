import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class PaymentMethodDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(16)
  card_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 15)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 150)
  token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  exp_month: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  exp_year: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cvc: number;
}
