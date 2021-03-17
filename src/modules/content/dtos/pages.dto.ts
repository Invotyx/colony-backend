import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class PagesDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 200)
  public title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 200)
  public subTitle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 300)
  public metaTags: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 300)
  public metaDescription: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 300)
  public slug: string;
}
