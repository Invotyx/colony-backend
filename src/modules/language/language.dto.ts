import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class LanguageDto {
  @ApiPropertyOptional()
  public id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 30)
  public title: string;

  @ApiProperty()
  @IsNotEmpty()
  public code: string;
}
