import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionTokenPayload } from "@psilo/auth";
import { verifySessionToken } from "@psilo/auth";

export const USER_SESSION_COOKIE = "psilo_user_session";
export const USER_REFRESH_COOKIE = "psilo_user_refresh";
export const USER_REFRESH_ROUTE = "/session/refresh";

const DEFAULT_USER_REDIRECT = "/inbox";
const DEFAULT_USER_API_BASE_URL = "http://127.0.0.1:4001/api/user";

function getUserApiBaseUrl() {
  return process.env.USER_API_BASE_URL ?? DEFAULT_USER_API_BASE_URL;
}

export function getUserSessionCookieMaxAge() {
  return 60 * 60;
}

export function getUserRefreshCookieMaxAge() {
  return 60 * 60 * 24;
}

export async function requestUserLogin(input: {
  tenantCode: string;
  loginId: string;
  password: string;
}) {
  try {
    const response = await fetch(`${getUserApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false as const,
        reason: response.status === 400 || response.status === 401 ? "invalid" : "unavailable",
      };
    }

    const payload = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    return {
      ok: true as const,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch {
    return {
      ok: false as const,
      reason: "unavailable" as const,
    };
  }
}

export async function requestUserRefresh(refreshToken: string) {
  try {
    const response = await fetch(`${getUserApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return {
        ok: false as const,
        reason: response.status === 400 || response.status === 401 ? "unauthorized" : "unavailable",
      };
    }

    const payload = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    return {
      ok: true as const,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch {
    return {
      ok: false as const,
      reason: "unavailable" as const,
    };
  }
}

export async function requestUserSession(accessToken: string) {
  try {
    const response = await fetch(`${getUserApiBaseUrl()}/auth/session`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false as const,
        reason: response.status === 401 ? "unauthorized" : "unavailable",
      };
    }

    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      reason: "unavailable" as const,
    };
  }
}

function buildLoginRedirect(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

function buildRefreshRedirect(nextPath: string) {
  return `${USER_REFRESH_ROUTE}?next=${encodeURIComponent(nextPath)}`;
}

function verifyUserAccessToken(token: string): SessionTokenPayload | null {
  try {
    const payload = verifySessionToken(token);
    return payload.surface === "user" && payload.tokenType === "access" ? payload : null;
  } catch {
    return null;
  }
}

export function readUserSession() {
  const token = cookies().get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyUserAccessToken(token);
}

export async function requireUserSession(nextPath = DEFAULT_USER_REDIRECT) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(USER_SESSION_COOKIE)?.value;
  const refreshToken = cookieStore.get(USER_REFRESH_COOKIE)?.value;

  if (!accessToken) {
    if (refreshToken) {
      redirect(buildRefreshRedirect(nextPath));
    }

    redirect(buildLoginRedirect(nextPath));
  }

  const session = verifyUserAccessToken(accessToken);

  if (!session) {
    if (refreshToken) {
      redirect(buildRefreshRedirect(nextPath));
    }

    redirect(buildLoginRedirect(nextPath));
  }

  const validation = await requestUserSession(accessToken);

  if (validation.ok) {
    return session;
  }

  if (validation.reason === "unauthorized" && refreshToken) {
    redirect(buildRefreshRedirect(nextPath));
  }

  if (validation.reason === "unauthorized") {
    redirect(buildLoginRedirect(nextPath));
  }

  return session;
}
