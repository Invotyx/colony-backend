
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IS_ENUM, Length } from 'class-validator';
import { CityEntity } from 'src/entities/city.entity';
import { CountryEntity } from 'src/entities/country.entity';
import { SectionsEntity } from 'src/entities/sections.entity';
import { In } from 'typeorm';

enum gender{
  male = "male",
  female = "female",
  non_binary="non_binary"
}

export class ContactDto {

  @IsOptional()
  @Length(3,60)
  public name: string;

  @IsNotEmpty()
  @Length(3,20)
  public phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  public isComplete: boolean;

  @IsOptional()
  public gender: gender;

  @IsOptional()
  @IsDate()
  public dob: Date;


  @IsOptional()
  public country: CountryEntity;

  
  @IsOptional()
  public city: CityEntity;

  
  @IsOptional()
  @Length(3,100)
  public state: string;

  
  @IsOptional()
  @Length(3,100)
  public timezone: string;

}  