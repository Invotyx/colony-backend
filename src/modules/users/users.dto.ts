import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  MaxLength,
} from 'class-validator';
import { CityEntity } from 'src/entities/city.entity';
import { CountryEntity } from 'src/entities/country.entity';
import { LanguageEntity } from 'src/entities/language.entity';

enum gender {
  male = 'male',
  female = 'female',
}

export class CreateUserDto {
  @Length(3, 20)
  @IsNotEmpty()
  firstName: string;

  @Length(3, 20)
  @IsNotEmpty()
  lastName: string;

  //@Unique({ table: TABLES.USERS.name, column: 'username' })
  @Length(3, 60)
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @MaxLength(30)
  @IsNotEmpty()
  email: string;

  @Length(3, 20)
  @IsOptional()
  mobile: string;

  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @Length(3, 30)
  @IsOptional()
  city: CityEntity;

  @Length(3, 30)
  @IsOptional()
  country: CountryEntity;

  @Length(0, 300)
  @IsOptional()
  statusMessage: string;

  @IsOptional()
  gender: gender;

  @IsOptional()
  dob: Date;

  @IsOptional()
  meta: any;

  @IsOptional()
  image: any;

  @IsOptional()
  isActive: boolean;

  @IsOptional()
  language: LanguageEntity;

  @IsNotEmpty()
  @Length(3,100)
  timezone: string;
  
  @IsOptional()
  urlId: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @Length(3, 30)
  firstName: string;
  
  @Length(3, 30)
  @IsOptional()
  country: CountryEntity;

  @IsOptional()
  @Length(3, 30)
  lastName: string;

  @Length(3, 20)
  @IsOptional()
  username: string;

  @IsEmail()
  @MaxLength(30)
  @IsOptional()
  email: string;

  @Length(3, 20)
  @IsOptional()
  mobile: string;

  @Length(8, 20)
  @IsOptional()
  password: string;

  @Length(8, 20)
  @IsOptional()
  oldPassword: string;

  @IsIn(['male', 'female'])
  @IsOptional()
  gender: gender;

  @IsOptional()
  meta: any;

  @Length(3, 30)
  @IsOptional()
  city: CityEntity;

  @Length(0, 300)
  @IsOptional()
  statusMessage: string;

  @IsOptional()
  dob: Date;

  @IsOptional()
  profileImage: string;

  @IsOptional()
  isActive: boolean;

  @IsOptional()
  language: LanguageEntity;

  @IsOptional()
  urlId: string;

  
  @IsOptional()
  @Length(3,100)
  timezone: string;
}

export class PasswordChange {
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @Length(5, 60)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateRole {
  @IsInt()
  @IsOptional()
  userId: number;

  // @IsInt()
  @IsOptional()
  roleId: number[];
}
