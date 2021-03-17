import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Equals, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class ProductsDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 100)
  public name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Equals('service')
  public type: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 300)
  public description: string;
}
