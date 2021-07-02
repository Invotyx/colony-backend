import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
  MinLength,
} from 'class-validator';

export enum presetTrigger {
  onBoard = 'onBoard',
  noResponse = 'noResponse',
  welcome = 'welcome',
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
  @MinLength(1)
  public body: string;
}

export class PresetsUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 100)
  public name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(1)
  public body: string;
}
