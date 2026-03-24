import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  createSessionPayload,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@psilo/auth";

import {
  ADMIN_REPOSITORY,
  type AdminAccountRecord,
  type AdminRepository,
} from "../../data/admin-repository";
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

    return this.createTokens(account);
  }

  async refresh(refreshToken: string) {
    let payload: ReturnType<typeof verifySessionToken>;

    try {
      payload = verifySessionToken(refreshToken);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (payload.surface !== "admin" || payload.tokenType !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const account = this.requireValidSessionAccount(
      await this.adminRepository.findAdminAccountById(payload.sub),
      payload,
    );

    return this.createTokens(account);
  }

  async getSession(session: ReturnType<typeof verifySessionToken>) {
    const account = this.requireValidSessionAccount(
      await this.adminRepository.findAdminAccountById(session.sub),
      session,
    );
    const adminRoles = account.roles.filter((role) =>
      ["tenant_admin", "super_admin"].includes(role),
    ) as ("tenant_admin" | "super_admin")[];

    return {
      user: {
        accountId: account.id,
        tenantId: account.tenantId,
        tenantCode: account.tenantCode,
        loginId: account.loginId,
        roles: [...account.roles],
      },
      session: {
        ...session,
        tokenVersion: account.tokenVersion,
        roles: adminRoles,
        projectIds: [],
      },
    };
  }

  private createTokens(account: AdminAccountRecord) {
    const adminRoles = account.roles.filter((role) =>
      ["tenant_admin", "super_admin"].includes(role),
    ) as ("tenant_admin" | "super_admin")[];

    const accessPayload = createSessionPayload({
      sub: account.id,
      tenantId: account.tenantId,
      tenantCode: account.tenantCode,
      loginId: account.loginId,
      sessionId: `${account.id}-admin-session`,
      tokenVersion: account.tokenVersion,
      surface: "admin",
      tokenType: "access",
      roles: adminRoles,
      projectIds: [],
    });
    const refreshPayload = createSessionPayload(
      {
        ...accessPayload,
        sessionId: `${account.id}-admin-refresh`,
        tokenType: "refresh",
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

  private requireValidSessionAccount(
    account: AdminAccountRecord | null,
    session: ReturnType<typeof verifySessionToken>,
  ) {
    if (!account) {
      throw new UnauthorizedException("Account was not found");
    }

    if (account.status !== "ACTIVE") {
      throw new UnauthorizedException("Account is not active");
    }

    if (account.tokenVersion !== session.tokenVersion) {
      throw new UnauthorizedException("Token version mismatch");
    }

    if (
      account.tenantId !== session.tenantId ||
      account.tenantCode !== session.tenantCode ||
      account.loginId !== session.loginId
    ) {
      throw new UnauthorizedException("Session scope mismatch");
    }

    if (!account.roles.includes("tenant_admin") && !account.roles.includes("super_admin")) {
      throw new UnauthorizedException("Admin role is required");
    }

    return account;
  }
}
