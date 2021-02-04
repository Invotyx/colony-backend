import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { ImagesEntity } from "src/entities/images.entity";
import { PagesEntity } from "src/entities/pages.entity";


enum sectionType{
  regular = "regular",
  faqs = "faqs",
  packages = "packages",
  featuredIn = "featuredIn",
  clients = "clients"

}

export class SectionsDto {
  
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3,200)
  public title: string;

  @IsOptional()
  @Length(3,200)
  public subTitle: string;

  @IsOptional()
  @Length(3,200)
  public primaryButton: string;

  @IsOptional()
  @Length(3,200)
  public secondaryButton: string;


  @IsOptional()
  @Length(3,10)
  public imagePosition: string;

  @IsOptional()
  public content: string;

  @IsNotEmpty()
  public sortOrder: number;

  @IsOptional()
  public pages: PagesEntity;

  @IsOptional()
  public sectionType: sectionType;
  
}
