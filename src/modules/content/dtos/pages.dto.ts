import { IsOptional, Length } from "class-validator";

export class PagesDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3,200)
  public title: string;

  @IsOptional()
  @Length(3,200)
  public subTitle: string;
  
  @IsOptional()
  @Length(3,300)
  public metaTags: string;
  
  @IsOptional()
  @Length(3,300)
  public metaDescription: string;

  @IsOptional()
  @Length(3,300)
  public slug: string;

}