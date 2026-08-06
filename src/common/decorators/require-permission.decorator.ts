import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../../roles-module/permission.enum';

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (permission: PermissionName) =>
  SetMetadata(PERMISSION_KEY, permission);
