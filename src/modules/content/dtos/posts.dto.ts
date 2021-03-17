import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class PostsDto {
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
  public slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  public content: string;
}
