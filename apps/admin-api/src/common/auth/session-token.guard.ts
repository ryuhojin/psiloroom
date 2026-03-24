import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verifySessionToken } from "@psilo/auth";

import { IS_PUBLIC_KEY } from "./public.decorator";

type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  session?: ReturnType<typeof verifySessionToken>;
};

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    if (context.getType() !== "http") {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    try {
      const token = header.slice("Bearer ".length);
      const payload = verifySessionToken(token);

      if (payload.surface !== "admin" || payload.tokenType !== "access") {
        throw new Error("Invalid surface");
      }

      request.session = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid access token");
    }
  }
}
