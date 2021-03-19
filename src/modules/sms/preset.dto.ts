import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';

enum presetTrigger {
  onBoard = 'onBoard',
  noResponse = 'noResponse',
}


export class PresetsDto {
  @ApiPropertyOptional()
  @IsOptional()
  public id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 100)
  public name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(presetTrigger)
  public trigger: presetTrigger;


  @ApiProperty()
  @IsNotEmpty()
  public body: string;

  

  
}


export class PresetsUpdateDto {

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 100)
  public name: string;

  @ApiPropertyOptional()
  @IsOptional()
  public body: string;

  

  
}
