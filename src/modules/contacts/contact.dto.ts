import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { CityEntity } from '../../services/city-country/entities/city.entity';
import { CountryEntity } from '../../services/city-country/entities/country.entity';

export enum gender {
  male = 'male',
  female = 'female',
  non_binary = 'non_binary',
}

export class ContactDto {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @Length(3, 60)
  public name: string;

  @ApiPropertyOptional({ enum: gender })
  @IsNotEmpty()
  public gender: gender;

  @ApiPropertyOptional()
  @IsNotEmpty()
  public dob: Date;

  @ApiPropertyOptional()
  @IsNotEmpty()
  public country: CountryEntity;

  @ApiPropertyOptional()
  @IsNotEmpty()
  public city: CityEntity;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @Length(3, 100)
  public state: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 100)
  public timezone: string;

  @ApiPropertyOptional()
  @IsOptional()
  public facebook: string;

  @ApiPropertyOptional()
  @IsOptional()
  public instagram: string;

  @ApiPropertyOptional()
  @IsOptional()
  public twitter: string;

  @ApiPropertyOptional()
  @IsOptional()
  public linkedin: string;
}


export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;
}

export enum dob {
  today = 'today',
  week = 'week',
  month = 'month',
}

export enum contacted {
  week = 'week',
  month = 'month',
  year = 'year',
  never = 'never',
}

export enum newContacts {
  recent = 'recent',
  week = 'week',
  month = 'month',
}

export class ContactFilter {
  @ApiPropertyOptional()
  @IsOptional()
  public ageFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  public ageTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['today', 'week', 'month', ''])
  public dob?: dob;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['week', 'month', 'year', 'never', ''])
  public contacted?: contacted;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['recent', 'week', 'month', ''])
  public newContacts?: newContacts;

  @ApiPropertyOptional()
  @IsOptional()
  public hasIg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public hasFb?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public hasTw?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public hasLi?: boolean;

  @ApiPropertyOptional({ enum: ['male', 'female', 'non_binary', ''] })
  @IsOptional()
  @IsIn(['male', 'female', 'non_binary', ''])
  public gender?: gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20)
  public city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(2, 10)
  public country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  public joinDate?: Date;

  @IsOptional()
  public successorId?: number;

  @IsOptional()
  public filter?: string;

  @IsOptional()
  public lat?: number;

  @IsOptional()
  public long?: number;

  @IsOptional()
  public radius?: number;
}
