import { IsString, IsNotEmpty, IsDateString, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsDateString()
  deadline: string;

  @IsInt()
  @IsNotEmpty()
  constructionSiteId: number;
}
