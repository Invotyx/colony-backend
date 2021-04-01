import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { CityEntity } from 'src/entities/city.entity';
import { CountryEntity } from 'src/entities/country.entity';

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

  @ApiPropertyOptional()
  @IsNotEmpty()
  @Length(3, 20)
  public phoneNumber: string;

  @ApiPropertyOptional({ enum: gender })
  @IsOptional()
  public gender: gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
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
  @Length(2, 10)
  public city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 30)
  public timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 10)
  public country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  public joinDate?: Date;
}
