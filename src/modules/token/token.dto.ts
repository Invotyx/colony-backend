import { IsInt, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class TokenDto {
  @IsInt()
  @IsOptional()
  userId: number;

  @IsInt()
  @IsOptional()
  token: number;
}
export class TokenUpdateDto {
  @IsInt()
  @IsOptional()
  userId: number;

  @IsInt()
  @IsOptional()
  token: number;
}

export class PasswordRestChange {
  @Length(5, 20)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsOptional()
  token: number;
}
