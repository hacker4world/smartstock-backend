import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PermissionName } from '../permission.enum';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsEnum(PermissionName, { each: true })
  permissions: PermissionName[];
}
