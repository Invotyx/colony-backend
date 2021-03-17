import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class ImagesDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 200)
  public url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 100)
  public title: string;

  @ApiPropertyOptional()
  @IsOptional()
  public pageId: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  public sectionId: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  public postId: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  public imagePosition: string;
}
