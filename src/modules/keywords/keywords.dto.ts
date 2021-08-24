import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class KeywordsDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 20)
  public keyword: string;

  @ApiProperty()
  @IsNotEmpty()
  public message: string;
}
