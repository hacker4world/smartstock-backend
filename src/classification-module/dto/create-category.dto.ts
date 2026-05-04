import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  subfamilyId: number;
}
