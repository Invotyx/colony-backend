import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, Length, Min } from 'class-validator';

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

export class Country {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(2, 3)
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 50)
  native: string;
}
export class City {
  @ApiProperty()
  @IsNotEmpty()
  @Length(2, 50)
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 50)
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 50)
  lat: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 50)
  long: string;
}
