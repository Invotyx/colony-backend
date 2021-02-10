import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { PagesEntity } from "src/entities/pages.entity";
import { SectionsEntity } from "src/entities/sections.entity";

export class ButtonsDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3,60)
  public text: string;
  
  @IsOptional()
  @Length(3,300)
  public link: string;
  
  @IsOptional()
  @Length(3,10)
  public type: string;

  @IsOptional()
  public section: SectionsEntity;
}
