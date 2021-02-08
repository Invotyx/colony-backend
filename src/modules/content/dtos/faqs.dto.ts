import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { PagesEntity } from "src/entities/pages.entity";
import { SectionsEntity } from "src/entities/sections.entity";

export class FaqsDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3,300)
  public question: string;
  
  @IsOptional()
  public answer: string;
  
}
