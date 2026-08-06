import { Global, Module } from '@nestjs/common';
import { SharedJwtModule } from '../jwt/jwt.module';
import { AccountsModule } from '../../accounts-module/accounts.module';
import { PermissionsGuard } from '../guards/permissions.guard';

@Global()
@Module({
  imports: [SharedJwtModule, AccountsModule],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard, SharedJwtModule, AccountsModule],
})
export class PermissionsModule {}
