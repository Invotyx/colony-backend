import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { CityEntity } from 'src/entities/city.entity';
import { CountryEntity } from 'src/entities/country.entity';
import { LanguageEntity } from 'src/entities/language.entity';

export enum gender {
  male = 'male',
  female = 'female',
}

export class CreateUserDto {
  @ApiProperty()
  @Length(3, 20)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @Length(3, 20)
  @IsNotEmpty()
  lastName: string;

  //@Unique({ table: TABLES.USERS.name, column: 'username' })
  @ApiProperty()
  @Length(3, 20)
  @IsNotEmpty()
  @IsNotIn(['admin', 'user','info','superadmin'])
  username: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(100)
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Length(3, 20)
  @IsOptional()
  mobile: string;

  @ApiProperty()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsOptional()
  city: CityEntity;

  @ApiProperty()
  @IsOptional()
  country: CountryEntity;

  @ApiProperty()
  @Length(0, 300)
  @IsOptional()
  statusMessage: string;

  @ApiProperty({ enum: gender, enumName: 'gender' })
  @IsOptional()
  gender: gender;

  @ApiProperty()
  @IsOptional()
  dob: Date;

  @ApiProperty()
  @IsOptional()
  meta: any;

  @ApiProperty()
  @IsOptional()
  image: any;

  @ApiProperty()
  @IsOptional()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  language: LanguageEntity;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 100)
  timezone: string;

  @ApiProperty()
  @IsOptional()
  urlId: string;
}

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @Length(3, 20)
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country: CountryEntity;

  @ApiProperty()
  @IsOptional()
  @Length(3, 20)
  lastName: string;

  @ApiProperty()
  @Length(3, 20)
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(100)
  @IsOptional()
  email: string;

  @ApiProperty()
  @Length(3, 20)
  @IsOptional()
  mobile: string;

  @ApiProperty()
  @Length(8, 20)
  @IsOptional()
  password: string;

  @ApiProperty()
  @Length(8, 20)
  @IsOptional()
  oldPassword: string;

  @ApiProperty({ enum: ['male', 'female'], enumName: 'gender' })
  @IsIn(['male', 'female'])
  @IsOptional()
  gender: gender;

  @ApiProperty()
  @IsOptional()
  meta: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city: CityEntity;

  @ApiProperty()
  @Length(0, 300)
  @IsOptional()
  statusMessage: string;

  @ApiProperty()
  @IsOptional()
  dob: Date;

  @ApiProperty()
  @IsOptional()
  profileImage: string;

  @ApiProperty()
  @IsOptional()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  language: LanguageEntity;

  @ApiProperty()
  @IsOptional()
  urlId: string;

  @ApiProperty()
  @IsOptional()
  @Length(3, 100)
  timezone: string;
}

export class PasswordChange {
  @ApiProperty()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
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
