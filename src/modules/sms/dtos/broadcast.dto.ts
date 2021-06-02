import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ContactFilter } from 'src/modules/contacts/contact.dto';

export class BroadcastDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 100)
  public name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 1000)
  body: string;

  @ApiProperty()
  @IsNotEmpty()
  filters: ContactFilter;

  @ApiPropertyOptional()
  @IsOptional()
  scheduled?: Date;
}
