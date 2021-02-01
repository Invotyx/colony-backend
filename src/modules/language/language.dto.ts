import { IsNotEmpty, Length } from "class-validator";

export class LanguageDto {
  public id: number;

  @IsNotEmpty()
  @Length(3,30)
  public title: string;

  @IsNotEmpty()
  public code: string;

}