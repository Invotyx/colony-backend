import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsIn, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CountryCost {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn([true, false])
  active: boolean;

  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  smsCost: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  phoneCost: number;
}
