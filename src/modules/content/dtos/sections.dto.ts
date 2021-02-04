import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { PagesEntity } from "src/entities/pages.entity";

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
  
}
