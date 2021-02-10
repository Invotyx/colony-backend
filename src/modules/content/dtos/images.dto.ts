import { IsOptional, Length } from "class-validator";
import { PagesEntity } from "src/entities/pages.entity";

export class ImagesDto {
  
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3,200)
  public url: string;
  
  @IsOptional()
  @Length(3,100)
  public title: string;
  
  
  @IsOptional()
  public pagesId: number|string;
  
  @IsOptional()
  public sectionsId: number|string;

  @IsOptional()
  public postsId: number | string;
  
  @IsOptional()
  public imagePosition: string;
}
