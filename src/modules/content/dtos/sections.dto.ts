import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { PagesEntity } from 'src/entities/pages.entity';

enum sectionType {
  regular = 'regular',
  faqs = 'faqs',
  packages = 'packages',
  featuredIn = 'featuredIn',
  banner = 'banner',
}

export class SectionsDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3, 200)
  public title: string;

  @IsOptional()
  @Length(3, 200)
  public subTitle: string;

  @IsOptional()
  @Length(3, 10)
  public imagePosition: string;

  @IsOptional()
  public content: string;

  @IsNotEmpty()
  public sortOrder: number;

  @IsOptional()
  public page: PagesEntity;

  @IsOptional()
  public isActive: boolean;

  @IsOptional()
  public sectionType: sectionType;

  @IsOptional()
  public buttons: any;
}
