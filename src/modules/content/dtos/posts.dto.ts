import { IsOptional, Length } from 'class-validator';

export class PostsDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3, 200)
  public title: string;

  @IsOptional()
  @Length(3, 200)
  public subTitle: string;

  @IsOptional()
  @Length(3, 300)
  public slug: string;

  @IsOptional()
  public content: string;
}
