import { Equals, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class ProductsDto {
  @IsOptional()
  public id: string;

  @IsNotEmpty()
  @Length(3, 100)
  public name: string;

  @IsOptional()
  @Equals('service')
  public type: string;

  @IsNotEmpty()
  @Length(3, 300)
  public description: string;
}
