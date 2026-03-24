import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionPayload, signSessionToken, verifySessionToken } from "@psilo/auth";

export const USER_SESSION_COOKIE = "psilo_user_session";
const DEFAULT_USER_REDIRECT = "/inbox";

export function createUserSessionToken(input: {
  tenantCode: string;
  loginId: string;
  password: string;
}) {
  if (
    input.tenantCode !== "ALPHA" ||
    input.loginId !== "dev.alpha" ||
    input.password !== "complexPass1"
  ) {
    return null;
  }

  return signSessionToken(
    createSessionPayload({
      sub: "account-user-alpha",
      tenantId: "tenant-alpha",
      tenantCode: "ALPHA",
      loginId: "dev.alpha",
      sessionId: "account-user-alpha-user-session",
      tokenVersion: 1,
      surface: "user",
      roles: ["project_member"],
      projectIds: ["project-psilo-core"],
    }),
  );
}

export function readUserSession() {
  const token = cookies().get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifySessionToken(token);
    return payload.surface === "user" ? payload : null;
  } catch {
    return null;
  }
}

export function requireUserSession(nextPath = DEFAULT_USER_REDIRECT) {
  const session = readUserSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
