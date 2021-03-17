import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class FaqsDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 300)
  public question: string;

  @ApiPropertyOptional()
  @IsOptional()
  public answer: string;
}
