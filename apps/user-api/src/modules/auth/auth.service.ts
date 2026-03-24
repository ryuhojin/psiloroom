import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createSessionPayload, signSessionToken, verifyPassword } from "@psilo/auth";

import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async login(payload: LoginDto) {
    const account = await this.userRepository.findUserAccountByTenantCode(
      payload.tenantCode,
      payload.loginId,
    );

    if (!account || !verifyPassword(payload.password, account.passwordHash)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (account.status !== "ACTIVE") {
      throw new UnauthorizedException("Account is not active");
    }

    const accessPayload = createSessionPayload({
      sub: account.id,
      tenantId: account.tenantId,
      tenantCode: account.tenantCode,
      loginId: account.loginId,
      sessionId: `${account.id}-user-session`,
      tokenVersion: account.tokenVersion,
      surface: "user",
      roles: ["project_member"],
      projectIds: [...account.projectIds],
    });

    return {
      accessToken: signSessionToken(accessPayload),
      user: {
        accountId: account.id,
        tenantId: account.tenantId,
        tenantCode: account.tenantCode,
        loginId: account.loginId,
        projectIds: [...account.projectIds],
      },
    };
  }
}
