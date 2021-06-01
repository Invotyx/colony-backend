import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
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
  @IsBoolean()
  public newContacts?: boolean;

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
}
