import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  createSessionPayload,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@psilo/auth";

import {
  USER_REPOSITORY,
  type UserAccountRecord,
  type UserRepository,
} from "../../data/user-repository";
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

    return this.createTokens(account);
  }

  async refresh(refreshToken: string) {
    let payload: ReturnType<typeof verifySessionToken>;

    try {
      payload = verifySessionToken(refreshToken);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (payload.surface !== "user" || payload.tokenType !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const account = this.requireValidSessionAccount(
      await this.userRepository.findUserAccountById(payload.sub),
      payload,
    );

    return this.createTokens(account);
  }

  async getSession(session: ReturnType<typeof verifySessionToken>) {
    const account = this.requireValidSessionAccount(
      await this.userRepository.findUserAccountById(session.sub),
      session,
    );
    const roles = ["project_member"] as const;

    return {
      user: {
        accountId: account.id,
        tenantId: account.tenantId,
        tenantCode: account.tenantCode,
        loginId: account.loginId,
        projectIds: [...account.projectIds],
      },
      session: {
        ...session,
        tokenVersion: account.tokenVersion,
        roles: [...roles],
        projectIds: [...account.projectIds],
      },
    };
  }

  private createTokens(account: UserAccountRecord) {
    const roles = ["project_member"] as const;

    const accessPayload = createSessionPayload({
      sub: account.id,
      tenantId: account.tenantId,
      tenantCode: account.tenantCode,
      loginId: account.loginId,
      sessionId: `${account.id}-user-session`,
      tokenVersion: account.tokenVersion,
      surface: "user",
      tokenType: "access",
      roles: [...roles],
      projectIds: [...account.projectIds],
    });
    const refreshPayload = createSessionPayload(
      {
        ...accessPayload,
        sessionId: `${account.id}-user-refresh`,
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
        projectIds: [...account.projectIds],
      },
    };
  }

  private requireValidSessionAccount(
    account: UserAccountRecord | null,
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

    return account;
  }
}
