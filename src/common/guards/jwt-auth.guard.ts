import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from '../../accounts-module/accounts.service';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  username: string;
  role: string | null;
  roleId: number | null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // Attach account and token to request for downstream use
    request['user'] = account;
    request['token'] = token;

    return true;
  }

  private extractToken(request: Request): string | null {
    // Primary: httpOnly cookie (set by the login endpoint)
    const cookies = request.cookies as Record<string, string> | undefined;
    if (cookies?.['access_token']) {
      return cookies['access_token'];
    }

    // Fallback: Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
