import { IsOptional, Length } from 'class-validator';

export class ImagesDto {
  @IsOptional()
  public id: number;

  @IsOptional()
  @Length(3, 200)
  public url: string;

  @IsOptional()
  @Length(3, 100)
  public title: string;

  @IsOptional()
  public pageId: number | string;

  @IsOptional()
  public sectionId: number | string;

  @IsOptional()
  public postId: number | string;

  @IsOptional()
  public imagePosition: string;
}
