import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
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
  @IsOptional()
  @Length(3, 60)
  public name: string;

  @ApiPropertyOptional({ enum: gender })
  @IsOptional()
  public gender: gender;

  @ApiPropertyOptional()
  @IsOptional()
  public dob: Date;

  @ApiPropertyOptional()
  @IsOptional()
  public country: CountryEntity;

  @ApiPropertyOptional()
  @IsOptional()
  public city: CityEntity;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 100)
  public state: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 100)
  public timezone: string;

  @ApiPropertyOptional()
  @IsOptional()
  public socialLinks: SocialLinks[];
}

export class SocialLinks {
  @IsNotEmpty()
  public link: string;

  @IsNotEmpty()
  @Length(2, 30)
  public title: string;
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

export class ContactFilter {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  public ageFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  public ageTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  public dob_today?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public dob_week?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public dob_month?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public contacted_week?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public contacted_month?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public contacted_year?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  public never_contacted?: Boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public newContacts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public newContacts_week?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public newContacts_month?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public hasIg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public hasFb?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public hasTw?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public hasLi?: boolean;

  @ApiPropertyOptional({ enum: ['male', 'female', 'non_binary'] })
  @IsOptional()
  @IsIn(['male', 'female', 'non_binary'])
  public gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20)
  public city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 30)
  public timezone?: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @Length(2, 10)
  public country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  public joinDate?: Date;

  @IsOptional()
  public successorId?: number;

  @IsOptional()
  public filter?: string;
}
