import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PermissionName } from '../permission.enum';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsEnum(PermissionName, { each: true })
  @IsOptional()
  permissions?: PermissionName[];
}
