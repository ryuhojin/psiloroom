import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { SessionTokenPayload } from "@psilo/auth";

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionTokenPayload => {
    const request = context.switchToHttp().getRequest<{ session: SessionTokenPayload }>();
    return request.session;
  },
);
