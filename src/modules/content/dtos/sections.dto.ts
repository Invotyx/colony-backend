import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsAlphanumeric,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
} from 'class-validator';
import { PagesEntity } from 'src/entities/pages.entity';

export enum sectionType {
  regular = 'regular',
  faqs = 'faqs',
  packages = 'packages',
  featuredIn = 'featuredIn',
  banner = 'banner',
}

export class SectionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  public id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 200)
  public title: string;

  @ApiPropertyOptional()
  @IsOptional()
  public subTitle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 10)
  @IsAlpha()
  public imagePosition: string;

  @ApiPropertyOptional()
  @IsOptional()
  public content: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsNumber()
  public sortOrder: number;

  @ApiPropertyOptional()
  @IsOptional()
  public page: PagesEntity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsAlphanumeric()
  public sectionType: string;

  @ApiPropertyOptional()
  @IsOptional()
  public buttons: any;
}
