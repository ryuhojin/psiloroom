import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionPayload, signSessionToken, verifySessionToken } from "@psilo/auth";

export const ADMIN_SESSION_COOKIE = "psilo_admin_session";
const DEFAULT_ADMIN_REDIRECT = "/dashboard";

export function createAdminSessionToken(input: {
  tenantCode: string;
  loginId: string;
  password: string;
}) {
  if (
    input.tenantCode !== "ALPHA" ||
    input.loginId !== "pm.alpha" ||
    input.password !== "complexPass1"
  ) {
    return null;
  }

  return signSessionToken(
    createSessionPayload({
      sub: "account-alpha-admin",
      tenantId: "tenant-alpha",
      tenantCode: "ALPHA",
      loginId: "pm.alpha",
      sessionId: "account-alpha-admin-admin-session",
      tokenVersion: 1,
      surface: "admin",
      roles: ["tenant_admin"],
      projectIds: [],
    }),
  );
}

export function readAdminSession() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifySessionToken(token);
    return payload.surface === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export function requireAdminSession(nextPath = DEFAULT_ADMIN_REDIRECT) {
  const session = readAdminSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
