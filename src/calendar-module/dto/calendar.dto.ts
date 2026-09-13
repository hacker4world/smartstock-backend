import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class CalendarDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  constructionSiteId?: number;
}
