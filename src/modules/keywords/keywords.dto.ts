import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class KeywordsDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 20)
  public keyword: string;

  @ApiProperty()
  @IsNotEmpty()
  public message: string;
}
