import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';
import { SectionsEntity } from 'src/entities/sections.entity';

export class ButtonsDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 60)
  public text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 300)
  public link: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 10)
  public type: string;

  @ApiPropertyOptional()
  @IsOptional()
  public section: SectionsEntity;
}
