import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CreateSubfamilyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  familyId: number;
}
