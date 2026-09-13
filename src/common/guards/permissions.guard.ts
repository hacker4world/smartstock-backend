import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from '../../accounts-module/accounts.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionName } from '../../roles-module/permission.enum';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  username: string;
  role: string | null;
  roleId: number | null;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Read the required permission from the route metadata
    const requiredPermission = this.reflector.getAllAndOverride<PermissionName>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @RequirePermission decorator is present, allow the request through
    if (!requiredPermission) {
      return true;
    }

    // 2. Extract and verify the JWT
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(
        "Token d'authentification manquant. Veuillez vous connecter.",
      );
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'Token invalide ou expiré. Veuillez vous reconnecter.',
      );
    }

    // 3. Load the account with role & permissions
    const accountResponse = await this.accountsService.findOne(payload.sub);
    const account = accountResponse.data;

    if (!account) {
      throw new UnauthorizedException('Compte introuvable.');
    }

    if (!account.confirmed) {
      throw new UnauthorizedException(
        "Votre compte n'a pas encore été confirmé par un administrateur.",
      );
    }

    if (!account.role) {
      throw new ForbiddenException(
        "Aucun rôle n'est assigné à votre compte. Contactez un administrateur.",
      );
    }

    // 4. Check the permission
    const hasPermission = account.role.permissions?.some(
      (p) => p.name === requiredPermission,
    );

    if (!hasPermission) {
      console.log(`Required permission : ${requiredPermission}`);
      throw new ForbiddenException(
        `Vous n'avez pas la permission requise pour accéder à cette ressource.`,
      );
    }

    // 5. Attach the account to the request for downstream use (controllers, other guards)
    request['user'] = account;

    return true;
  }

  private extractToken(request: Request): string | null {
    // Primary: httpOnly cookie (set by the login endpoint)
    const cookies = request.cookies as Record<string, string> | undefined;
    if (cookies?.['access_token']) {
      return cookies['access_token'];
    }

    // Fallback: Authorization header (useful for testing / Swagger / mobile clients)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
