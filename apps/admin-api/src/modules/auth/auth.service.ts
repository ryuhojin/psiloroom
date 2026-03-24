import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createSessionPayload, signSessionToken, verifyPassword } from "@psilo/auth";

import { ADMIN_REPOSITORY, type AdminRepository } from "../../data/admin-repository";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
  ) {}

  async login(payload: LoginDto) {
    const account = await this.adminRepository.findAdminAccountByTenantCode(
      payload.tenantCode,
      payload.loginId,
    );

    if (!account || !verifyPassword(payload.password, account.passwordHash)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (account.status !== "ACTIVE") {
      throw new UnauthorizedException("Account is not active");
    }

    if (!account.roles.includes("tenant_admin") && !account.roles.includes("super_admin")) {
      throw new UnauthorizedException("Admin role is required");
    }

    const accessPayload = createSessionPayload({
      sub: account.id,
      tenantId: account.tenantId,
      tenantCode: account.tenantCode,
      loginId: account.loginId,
      sessionId: `${account.id}-admin-session`,
      tokenVersion: account.tokenVersion,
      surface: "admin",
      roles: account.roles.filter((role) =>
        ["tenant_admin", "super_admin"].includes(role),
      ) as ("tenant_admin" | "super_admin")[],
      projectIds: [],
    });
    const refreshPayload = createSessionPayload(
      {
        ...accessPayload,
        sessionId: `${account.id}-admin-refresh`,
      },
      60 * 60 * 24,
    );

    return {
      accessToken: signSessionToken(accessPayload),
      refreshToken: signSessionToken(refreshPayload),
      user: {
        accountId: account.id,
        tenantId: account.tenantId,
        tenantCode: account.tenantCode,
        loginId: account.loginId,
        roles: [...account.roles],
      },
    };
  }
}
