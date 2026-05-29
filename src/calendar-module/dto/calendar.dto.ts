import { IsInt, Min, Max } from 'class-validator';

export class CalendarDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;
}
