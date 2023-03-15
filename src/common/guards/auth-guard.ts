import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import {JwtService} from "../../modules/public/auth/applications/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      return true;
    }

    try {
      const tokenPayload = this.jwtService.getTokenPayload(token);

      request.userId = tokenPayload.userId; // TODO need resolve
    } catch (e) {
      console.error(e);
    }

    return true;
  }
}
