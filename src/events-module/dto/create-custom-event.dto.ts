import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCustomEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string; // ISO 8601 date string
}
