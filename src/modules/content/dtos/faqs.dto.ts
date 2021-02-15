import { IsOptional, Length } from 'class-validator';

export class FaqsDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3, 300)
  public question: string;

  @IsOptional()
  public answer: string;
}
